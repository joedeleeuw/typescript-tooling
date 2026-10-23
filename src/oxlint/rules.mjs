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

// Rules from the published @rikalabs/oxlint-standards plugin.
export const rikaLabsRules = Object.freeze({
  "rikalabs/bun-no-bun-specific-in-shared": "error",
  "rikalabs/no-ai-debt-comments": "error",
  "rikalabs/no-anemic-errors": "error",
  "rikalabs/no-debug-residue-filenames": "error",
  "rikalabs/no-default-export-in-domain": "error",
  "rikalabs/no-duplicate-context": "error",
  "rikalabs/no-generic-module-names": "error",
  "rikalabs/no-placeholder-tests": "error",
  "rikalabs/no-relative-cross-package-imports": "error",
  "rikalabs/no-todo-without-issue": "error",
  "rikalabs/no-trivial-property-helpers": "error",
  "rikalabs/no-tutorial-comments": "error",
  // Opt-in: 6 of 20 sampled reports on four public repositories were real problems.
  "rikalabs/no-unlisted-external-imports": "off",
});

// Rules vendored into this package's own plugin (src/oxlint-plugin); see NOTICE.
export const vendoredRules = Object.freeze({
  "tooling/confine-owner": "error",
  "tooling/docs-source-policy": "error",
  "tooling/icon-button-requires-tooltip": "error",
  "tooling/no-adhoc-loader": "error",
  "tooling/no-ambient-hotkey-format": "error",
  "tooling/no-async-context-enter-with": "error",
  "tooling/no-auth-token-in-web-storage": "error",
  "tooling/no-awaited-builder-union": "error",
  "tooling/no-calling-components-as-functions": "error",
  "tooling/no-centered-scroll-column": "error",
  "tooling/no-dialog-trigger-menu-item": "error",
  "tooling/no-disabled-tooltip-trigger": "error",
  "tooling/no-eager-singleton": "error",
  "tooling/no-inline-style-colors": "error",
  "tooling/no-omitted-prop-respread": "error",
  "tooling/no-partial-record-satisfies": "error",
  "tooling/no-path-prefix-containment": "error",
  // Opt-in: 9 of 20 sampled reports on four public repositories were real problems, all in apps that ship right-to-left locales.
  "tooling/no-physical-properties": "off",
  "tooling/no-portal-under-interactive-ancestor": "error",
  "tooling/no-raw-filename-write": "error",
  // Opt-in: 0 of 20 sampled reports on four public repositories were real problems; enable where the suggested tokens exist.
  "tooling/no-raw-foreground-opacity": "off",
  "tooling/no-redacted-log-attribute-key": "error",
  "tooling/no-spread-input-in-query-key": "error",
  "tooling/no-static-devtools-import": "error",
  "tooling/no-unformatted-number": "error",
  "tooling/no-unknown-type-aliases": "error",
  "tooling/no-unsafe-inner-html": "error",
  "tooling/no-unsanitized-href": "error",
  "tooling/require-detached-label-shape": "error",
  "tooling/require-dir-on-rendered-name": "error",
  "tooling/require-exhaustive-panic": "error",
  // Opt-in: 5 of 20 sampled reports on four public repositories were real problems; 12 were in tests.
  "tooling/require-fetch-timeout": "off",
  "tooling/require-function-replacer": "error",
  // Opt-in: 4 of 20 sampled reports on four public repositories were real problems.
  "tooling/require-query-key-factory": "off",
  "tooling/require-query-signal": "error",
  "tooling/require-safe-window-open": "error",
  "tooling/require-secure-document-response": "error",
  "tooling/require-stable-snapshot": "error",
  "tooling/require-stream-reader-disposal": "error",
});
