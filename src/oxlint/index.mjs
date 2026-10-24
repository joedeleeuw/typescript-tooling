import { createRequire } from "node:module";
import { resolve } from "node:path";
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

export function typescriptBaselineTier(repoRoot = process.cwd()) {
  const consumerRequire = createRequire(resolve(repoRoot, "package.json"));
  try {
    consumerRequire.resolve("oxlint-tsgolint/package.json");
    return "full";
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
    return "syntax-only";
  }
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

export function createConfig({
  repoRoot = process.cwd(),
  maxLines = 1500,
  typeAware = typescriptBaselineTier(repoRoot) === "full",
  enforceNoPropertyDefaultFallbacks = false,
  propertyDefaultAllowedFiles = [],
  enforceNoDerivedStateEffects = false,
} = {}) {
  if (typeAware && typescriptBaselineTier(repoRoot) !== "full") {
    throw new Error(
      "Install oxlint-tsgolint to enable the type-aware baseline."
    );
  }
  const optionalEcosystemConfigurations = [
    {
      enabled: enforceNoPropertyDefaultFallbacks,
      plugin: {
        name: "@rikalabs",
        specifier: packageRequire.resolve("@rikalabs/oxlint-standards/plugin"),
      },
      rules: { "@rikalabs/no-property-default-fallbacks": "error" },
    },
    {
      enabled: enforceNoDerivedStateEffects,
      plugin: {
        name: "react-hooks-js",
        specifier: packageRequire.resolve("eslint-plugin-react-hooks"),
      },
      rules: { "react-hooks-js/no-deriving-state-in-effects": "error" },
    },
  ].filter(({ enabled }) => enabled);
  const optionalEcosystemPlugins = optionalEcosystemConfigurations.map(
    ({ plugin }) => plugin
  );
  const optionalEcosystemRules = Object.fromEntries(
    optionalEcosystemConfigurations.flatMap(({ rules }) =>
      Object.entries(rules)
    )
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
