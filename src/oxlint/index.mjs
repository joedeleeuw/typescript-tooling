import { statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { defineConfig } from "oxlint";
import {
  complexityRules,
  typescriptSyntaxRules,
  typescriptTypeAwareRules,
} from "./rules.mjs";

export { complexityRules, typescriptSyntaxRules, typescriptTypeAwareRules };
export { adoptionPresets, createAdoptionOxlintConfig } from "./adoption.mjs";

const packageRequire = createRequire(import.meta.url);
const baselineJavascriptPlugins = [
  {
    name: "eslint-comments",
    specifier: packageRequire.resolve(
      "@eslint-community/eslint-plugin-eslint-comments"
    ),
  },
  {
    name: "unicorn-js",
    specifier: packageRequire.resolve("eslint-plugin-unicorn"),
  },
];

const tsgolintExecutableNames =
  process.platform === "win32"
    ? ["tsgolint.cmd", "tsgolint.exe"]
    : ["tsgolint"];

function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") return false;
    throw error;
  }
}

function directoryHasTsgolint(directory) {
  return tsgolintExecutableNames.some((name) =>
    isFile(resolve(directory, name))
  );
}

export function typescriptBaselineTier(repoRoot = process.cwd()) {
  const envPath = process.env.OXLINT_TSGOLINT_PATH?.trim();
  if (envPath) {
    const override = resolve(repoRoot, envPath);
    if (isFile(override)) return "full";
    if (directoryHasTsgolint(override)) return "full";
    throw new Error(
      `OXLINT_TSGOLINT_PATH must name a tsgolint executable or a directory containing one; received ${override}.`
    );
  }

  for (let directory = resolve(repoRoot); ; directory = dirname(directory)) {
    if (directoryHasTsgolint(resolve(directory, "node_modules/.bin"))) {
      return "full";
    }
    if (dirname(directory) === directory) break;
  }
  return "syntax-only";
}

const disabledCategories = {
  correctness: "off",
  nursery: "off",
  pedantic: "off",
  perf: "off",
  restriction: "off",
  style: "off",
  suspicious: "off",
};

const baselineIgnorePatterns = [
  "**/node_modules/**",
  "**/dist/**",
  "**/coverage/**",
  "reports/**",
  "**/*.d.ts",
  "**/*.d.mts",
  "**/*.d.cts",
  "**/*.tsbuildinfo",
];

function propertyDefaultOverride(file) {
  if (typeof file !== "string" || file.length === 0) {
    throw new TypeError(
      "propertyDefaultAllowedFiles entries must be non-empty repository-relative file patterns."
    );
  }
  const pattern = file.replaceAll("\\", "/").replace(/^\.\//u, "");
  const invalid = [
    pattern.startsWith("/"),
    /^[A-Za-z]:\//u.test(pattern),
    pattern.split("/").includes(".."),
  ].some(Boolean);
  if (invalid) {
    throw new TypeError(
      `propertyDefaultAllowedFiles entries must stay relative to the repository; received ${file}.`
    );
  }
  return {
    files: [pattern.startsWith("**/") ? pattern : `**/${pattern}`],
    rules: { "@rikalabs/no-property-default-fallbacks": "off" },
  };
}

const eslintCommentRules = {
  "eslint-comments/require-description": "error",
  "eslint-comments/disable-enable-pair": "error",
  "eslint-comments/no-duplicate-disable": "error",
  "eslint-comments/no-unlimited-disable": "error",
  "eslint-comments/no-unused-disable": "error",
  "eslint-comments/no-unused-enable": "error",
};

const optionalEcosystemCatalog = [
  {
    key: "enforceNoPropertyDefaultFallbacks",
    plugin: {
      name: "@rikalabs",
      specifier: packageRequire.resolve("@rikalabs/oxlint-standards/plugin"),
    },
    rules: { "@rikalabs/no-property-default-fallbacks": "error" },
  },
  {
    key: "enforceNoDerivedStateEffects",
    plugin: {
      name: "react-hooks-js",
      specifier: packageRequire.resolve("eslint-plugin-react-hooks"),
    },
    rules: { "react-hooks-js/no-deriving-state-in-effects": "error" },
  },
];

export function createConfig(options = {}) {
  const {
    repoRoot = process.cwd(),
    maxLines = 1500,
    typeAware = typescriptBaselineTier(repoRoot) === "full",
    propertyDefaultAllowedFiles = [],
  } = options;
  if (typeAware && typescriptBaselineTier(repoRoot) !== "full") {
    throw new Error(
      "Install oxlint-tsgolint to enable the type-aware baseline."
    );
  }
  const activeEcosystem = optionalEcosystemCatalog.filter(({ key }) =>
    Boolean(options[key])
  );
  const optionalEcosystemPlugins = activeEcosystem.map(({ plugin }) => plugin);
  const optionalEcosystemRules = Object.fromEntries(
    activeEcosystem.flatMap(({ rules }) => Object.entries(rules))
  );
  return defineConfig({
    categories: disabledCategories,
    ignorePatterns: baselineIgnorePatterns,
    jsPlugins: [...baselineJavascriptPlugins, ...optionalEcosystemPlugins],
    options: {
      denyWarnings: true,
      reportUnusedDisableDirectives: "error",
      typeAware,
    },
    plugins: ["eslint", "typescript"],
    rules: {
      ...complexityRules,
      ...typescriptSyntaxRules,
      ...(typeAware ? typescriptTypeAwareRules : {}),
      "unicorn-js/prefer-switch": ["error", { minimumCases: 4 }],
      ...optionalEcosystemRules,
      ...eslintCommentRules,
      "max-lines": [
        "error",
        { max: maxLines, skipBlankLines: false, skipComments: false },
      ],
    },
    overrides: propertyDefaultAllowedFiles.map(propertyDefaultOverride),
  });
}

export default createConfig;
