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

function nameOfBinding(key) {
  return key.type === "JSXNamespacedName" ? null : (key.name ?? key.value);
}

function boundName(template) {
  let current = template;
  for (;;) {
    const parent = current.parent;
    switch (parent.type) {
      case "Property":
        return parent.value === current && !parent.computed
          ? nameOfBinding(parent.key)
          : null;
      case "JSXAttribute":
        return nameOfBinding(parent.name);
      case "ConditionalExpression":
        if (parent.test === current) return null;
        current = parent;
        break;
      case "ArrayExpression":
      case "JSXExpressionContainer":
      case "LogicalExpression":
        current = parent;
        break;
      case "MemberExpression":
        if (parent.object !== current) return null;
        if (parent.parent.type !== "CallExpression") return null;
        if (parent.parent.callee !== parent) return null;
        current = parent.parent;
        break;
      default:
        return null;
    }
  }
}

const noUnsafeQuery = sqlTemplate.rules["no-unsafe-query"];
const sqlTemplatePlugin = {
  ...sqlTemplate,
  rules: {
    ...sqlTemplate.rules,
    "no-unsafe-query": {
      ...noUnsafeQuery,
      meta: {
        ...noUnsafeQuery.meta,
        schema: [
          {
            type: "object",
            properties: {
              nonQueryBindings: {
                type: "array",
                items: { type: "string", minLength: 1 },
                uniqueItems: true,
              },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const visitors = noUnsafeQuery.create(context);
        const nonQueryBindings = new Set(
          context.options[0]?.nonQueryBindings ?? []
        );
        return {
          TemplateLiteral(node) {
            if (!nonQueryBindings.has(boundName(node))) {
              visitors.TemplateLiteral(node);
            }
          },
        };
      },
    },
  },
};

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
        "sql-template": sqlTemplatePlugin,
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
