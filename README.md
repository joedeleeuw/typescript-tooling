# @joedeleeuw/typescript-tooling

One dependency for reusable TypeScript, ESLint, Oxlint, Prettier and dependency-cruiser defaults. No Antidrift dependency, project paths, app framework, copied registries or wrapper CLI.

## Ownership

- This package owns standard rules and tool setup, plus lint rules vendored from projects that publish no package.
- Antidrift owns only its own drift and policy rules.
- One owner per problem. A check from a published, maintained package is a dependency that this package turns on, without re-proving it. A copied rule that only duplicates a rule this package already enables is neither vendored nor enabled.

## Install

Before the first npm release, install an immutable commit from `joedeleeuw/typescript-tooling`. After publication, use a versioned dependency. This repository does not publish automatically.

Use TypeScript 6 with the ESLint/parser compiler API (verified with TypeScript 6.0.3). TypeScript 7's published package does not provide that API. Oxlint's optional `oxlint-tsgolint` uses its own native compiler and is independent of the workspace compiler package.

The Oxlint plugin packages, `@rikalabs/oxlint-standards` and `@oxlint/plugins`, are ordinary dependencies. The `oxlint` peer range is unchanged and proven at 1.78.0 and 1.87.0.

## Native entrypoints

- `@joedeleeuw/typescript-tooling/tsconfig/base.json`: strict, portable compiler defaults; consumer owns `lib`, `jsx`, paths, includes and build output.
- `/prettier`: 2 spaces, 80 columns, double quotes, semicolons, ES5 trailing commas.
- `/eslint`: `createConfig({ tsconfigRootDir, projectService })` and `restrictedSyntax` (enums, React 19 forwardRef and async `forEach` callbacks); includes SQL template safety. Compose with your framework and typed ESLint configs. Async `filter`, `some`, `every` and `find*` callbacks are reported by Oxlint's `typescript/no-misused-promises` in the full tier.
- `/oxlint`: `createConfig({ repoRoot, maxLines, typeAware })`, complexity 25 (modified), depth 4, parameters 7, no nested ternaries, file cap 1500, TS syntax/type-aware rules, lint-directive descriptions, and the `rikalabs` and `tooling` plugin rules listed below. `maxLines` is consumer-owned; the starter uses 1000. Type-aware rules are included when the consumer resolves `oxlint-tsgolint`; explicit `typeAware: true` fails if it is missing. `typescriptBaselineTier()` reports the effective tier.
- `/oxlint` also exposes `complexityRules`, `typescriptSyntaxRules`, `typescriptTypeAwareRules`, `adoptionPresets` and `createAdoptionOxlintConfig({ presets })` for incremental adoption. Named native-rule maps are opt-in inventories, not an all-rules recommended preset. Keep adoption choices local.
- `/dependency-cruiser`: CommonJS `createConfig({ roots, cycleSeverity })`, cycles are errors by default and tests folders are private. Consumers own graph roots, platform resolver extensions and layer allowlists. Existing cycle debt may use a documented local warning override.

```js
import { createConfig } from "@joedeleeuw/typescript-tooling/eslint";
import { createConfig as antidrift } from "@joedeleeuw/antidrift/eslint-config";

export default [
  ...createConfig({ tsconfigRootDir: import.meta.dirname }),
  ...antidrift({ tsconfigRootDir: import.meta.dirname }),
];
```

Use the native discovered filename `oxlint.config.ts` (or pass `--config` explicitly); Oxlint does not automatically discover `oxlint.config.mjs`.

For Oxlint, merge tooling and Antidrift `rules`, `jsPlugins`, `ignorePatterns` and `overrides` explicitly rather than letting a top-level spread discard one owner's configuration. The separate [starter](https://github.com/joedeleeuw/typescript-boilerplate) demonstrates composition. Antidrift remains the independent owner of drift rules and registry-aware import restrictions.

## Oxlint plugin rules

`createConfig` registers two JS plugins beside `eslint-comments`. Both install with this package; neither adds a peer dependency.

`rikalabs` is the published [`@rikalabs/oxlint-standards`](https://github.com/Rika-Labs/oxlint-standards) plugin (0.8, MIT). These rules are `error`: `bun-no-bun-specific-in-shared`, `no-ai-debt-comments`, `no-anemic-errors`, `no-debug-residue-filenames`, `no-default-export-in-domain`, `no-duplicate-context`, `no-generic-module-names`, `no-placeholder-tests`, `no-relative-cross-package-imports`, `no-todo-without-issue`, `no-trivial-property-helpers` and `no-tutorial-comments`. `no-unlisted-external-imports` is registered `off`. `no-as-never` is not enabled because the full tier's `typescript/no-unsafe-type-assertion` already reports it.

`tooling` is this package's own plugin, `src/oxlint-plugin`, holding rules vendored from projects that publish no package. [NOTICE](NOTICE) lists each file's origin, license and changes.

- stella (Apache-2.0): `confine-owner`, `docs-source-policy`, `icon-button-requires-tooltip`, `no-adhoc-loader`, `no-ambient-hotkey-format`, `no-async-context-enter-with`, `no-auth-token-in-web-storage`, `no-awaited-builder-union`, `no-centered-scroll-column`, `no-dialog-trigger-menu-item`, `no-disabled-tooltip-trigger`, `no-eager-singleton`, `no-inline-style-colors`, `no-omitted-prop-respread`, `no-partial-record-satisfies`, `no-path-prefix-containment`, `no-physical-properties`, `no-portal-under-interactive-ancestor`, `no-raw-filename-write`, `no-raw-foreground-opacity`, `no-redacted-log-attribute-key`, `no-spread-input-in-query-key`, `no-static-devtools-import`, `no-unformatted-number`, `no-unsafe-inner-html`, `no-unsanitized-href`, `require-detached-label-shape`, `require-dir-on-rendered-name`, `require-exhaustive-panic`, `require-fetch-timeout`, `require-function-replacer`, `require-query-key-factory`, `require-query-signal`, `require-safe-window-open`, `require-secure-document-response`, `require-stable-snapshot` and `require-stream-reader-disposal`.
- anti-slop (MIT): `no-unknown-type-aliases`. Its `no-chained-type-assertions` and `no-widen-then-assert` are not vendored; the full tier's `typescript/no-unsafe-type-assertion` reports both.
- getsentry/sentry (FSL-1.1-Apache-2.0): `no-calling-components-as-functions`.

Vendored rules are `error` except `no-physical-properties`, `no-raw-foreground-opacity`, `require-fetch-timeout` and `require-query-key-factory`, which are `off`. Turn one on, or give a rule its options (`confine-owner` entries, `docs-source-policy` sources, `no-unsanitized-href` sanitizers), in the consumer's `rules`, for example `"tooling/no-physical-properties": "error"`.

## Maintenance and proof

`pnpm check` checks formatting, declarations and the actual packed package in separately installed consumers. Acceptance covers full and syntax-only TS tiers, real lint rejection, compiler strictness, formatting and dependency graph rejection. Each vendored rule rejects an invalid snippet and accepts a valid one on both Oxlint engines; `rikalabs` rules are only shown to load and lint, since this repository does not maintain them. No npm publication or product deployment is part of this command.

Changing this dependency updates defaults in existing consumers. Changing the starter only helps newly created projects. Personal agent rules remain in dotfiles; checked-in project instructions and exceptions remain in each repository.
