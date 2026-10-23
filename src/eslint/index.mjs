import parser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import sqlTemplate from "eslint-plugin-sql-template";

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
  {
    selector:
      'CallExpression[callee.property.name="forEach"] > :matches(ArrowFunctionExpression, FunctionExpression)[async=true]',
    message:
      "forEach does not wait for async callbacks; use for...of with await, or Promise.all.",
  },
]);

export function createConfig({
  tsconfigRootDir = process.cwd(),
  projectService = true,
} = {}) {
  return defineConfig({
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser,
      parserOptions: { projectService, tsconfigRootDir },
    },
    plugins: { "sql-template": sqlTemplate },
    rules: {
      "no-restricted-syntax": ["error", ...restrictedSyntax],
      "sql-template/no-unsafe-query": "error",
    },
  });
}

export default createConfig;
