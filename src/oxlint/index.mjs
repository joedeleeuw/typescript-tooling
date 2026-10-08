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

export function createConfig({
  repoRoot = process.cwd(),
  maxLines = 1500,
  typeAware = typescriptBaselineTier(repoRoot) === "full",
} = {}) {
  if (typeAware && typescriptBaselineTier(repoRoot) !== "full") {
    throw new Error(
      "Install oxlint-tsgolint to enable the type-aware baseline."
    );
  }
  return defineConfig({
    categories: {
      correctness: "off",
      nursery: "off",
      pedantic: "off",
      perf: "off",
      restriction: "off",
      style: "off",
      suspicious: "off",
    },
    ignorePatterns: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "reports/**",
      "**/*.d.ts",
      "**/*.d.mts",
      "**/*.d.cts",
      "**/*.tsbuildinfo",
    ],
    jsPlugins: [
      {
        name: "eslint-comments",
        specifier: packageRequire.resolve(
          "@eslint-community/eslint-plugin-eslint-comments"
        ),
      },
    ],
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
      "eslint-comments/require-description": "error",
      "eslint-comments/disable-enable-pair": "error",
      "eslint-comments/no-duplicate-disable": "error",
      "eslint-comments/no-unlimited-disable": "error",
      "eslint-comments/no-unused-disable": "error",
      "eslint-comments/no-unused-enable": "error",
      "max-lines": [
        "error",
        { max: maxLines, skipBlankLines: false, skipComments: false },
      ],
    },
  });
}

export default createConfig;
