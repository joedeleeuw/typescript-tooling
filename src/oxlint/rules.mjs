const modifiedComplexityOptions = Object.freeze({
  max: 25,
  variant: "modified",
});
const maxParametersOptions = Object.freeze({ max: 7 });

export const complexityRules = Object.freeze({
  complexity: ["error", modifiedComplexityOptions],
  "max-depth": ["error", 4],
  "max-params": ["error", maxParametersOptions],
  "no-nested-ternary": "error",
});

export const typescriptSyntaxRules = Object.freeze({
  "typescript/no-explicit-any": "error",
  "typescript/no-empty-object-type": "error",
  "typescript/no-extra-non-null-assertion": "error",
  "typescript/no-non-null-assertion": "error",
  "typescript/no-non-null-asserted-optional-chain": "error",
  "typescript/no-unsafe-function-type": "error",
  "typescript/no-wrapper-object-types": "error",
  "typescript/no-namespace": "error",
  "typescript/no-require-imports": "error",
  "typescript/consistent-type-imports": [
    "error",
    { prefer: "type-imports", fixStyle: "separate-type-imports" },
  ],
  "typescript/no-import-type-side-effects": "error",
  "typescript/no-unnecessary-type-constraint": "error",
  "typescript/no-useless-empty-export": "error",
  "typescript/prefer-function-type": "error",
  "typescript/ban-ts-comment": [
    "error",
    { "ts-expect-error": "allow-with-description" },
  ],
});

export const typescriptTypeAwareRules = Object.freeze({
  "typescript/no-unsafe-assignment": "error",
  "typescript/no-unsafe-argument": "error",
  "typescript/no-unsafe-call": "error",
  "typescript/no-unsafe-enum-comparison": "error",
  "typescript/no-unsafe-member-access": "error",
  "typescript/no-unsafe-return": "error",
  "typescript/no-unsafe-type-assertion": "error",
  "typescript/no-base-to-string": "error",
  "typescript/no-deprecated": "error",
  "typescript/no-misused-promises": [
    "error",
    { checksVoidReturn: { arguments: false, attributes: false } },
  ],
  "typescript/restrict-plus-operands": "error",
  "typescript/no-unnecessary-type-assertion": "error",
  "typescript/no-unnecessary-template-expression": "error",
  "typescript/no-unnecessary-type-arguments": "error",
  "typescript/prefer-find": "error",
  "typescript/prefer-includes": "error",
  "typescript/prefer-reduce-type-parameter": "error",
  "typescript/prefer-promise-reject-errors": "error",
  "typescript/only-throw-error": "error",
  "typescript/require-await": "error",
  "typescript/no-unnecessary-condition": [
    "error",
    { allowConstantLoopConditions: true },
  ],
});
