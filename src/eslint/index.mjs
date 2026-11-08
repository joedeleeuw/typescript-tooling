import parser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import playwright from "eslint-plugin-playwright";
import sqlTemplate from "eslint-plugin-sql-template";
import typescriptEslint from "typescript-eslint";

export const restrictedSyntax = Object.freeze([
  {
    selector: "TSEnumDeclaration",
    message:
      "Do not declare enums; use a union type or an as-const object so values stay structurally checkable and erase at runtime.",
  },
  {
    selector:
      'CallExpression[callee.object.name="React"][callee.property.name="forwardRef"]',
    message:
      "forwardRef is deprecated in React 19; accept ref as an ordinary prop instead.",
  },
  {
    selector: 'CallExpression[callee.name="forwardRef"]',
    message:
      "forwardRef is deprecated in React 19; accept ref as an ordinary prop instead.",
  },
]);

function playwrightConfigs(files) {
  if (!Array.isArray(files)) {
    throw new TypeError(
      `playwrightFiles must be an array of repository-relative patterns; received ${JSON.stringify(files)}.`
    );
  }
  const invalid = files.filter((file) => {
    if (typeof file !== "string" || file.length === 0) return true;
    const pattern = file.replaceAll("\\", "/");
    return (
      pattern.startsWith("/") ||
      /^[A-Za-z]:\//u.test(pattern) ||
      pattern.split("/").includes("..")
    );
  });
  if (invalid.length > 0) {
    throw new TypeError(
      `playwrightFiles entries must be non-empty patterns relative to the repository, without drive letters, leading slashes or "..": received ${JSON.stringify(invalid)}.`
    );
  }
  return files.length > 0
    ? [{ ...playwright.configs["flat/recommended"], files }]
    : [];
}

export function createConfig({
  tsconfigRootDir = process.cwd(),
  projectService = true,
  playwrightFiles = [],
} = {}) {
  return defineConfig(
    {
      files: ["**/*.{ts,tsx,mts,cts}"],
      languageOptions: {
        parser,
        parserOptions: { projectService, tsconfigRootDir },
      },
      plugins: {
        "sql-template": sqlTemplate,
        "@typescript-eslint": typescriptEslint.plugin,
      },
      rules: {
        "@typescript-eslint/no-explicit-any": "error",
        "no-restricted-syntax": ["error", ...restrictedSyntax],
        "sql-template/no-unsafe-query": "error",
      },
    },
    playwrightConfigs(playwrightFiles)
  );
}

export default createConfig;
