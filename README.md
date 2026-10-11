# @joedeleeuw/typescript-tooling

One dependency for reusable TypeScript, ESLint, Oxlint, Prettier and dependency-cruiser defaults. No Antidrift dependency, project paths, app framework, copied registries or wrapper CLI.

## Install

Before the first npm release, install an immutable commit from `joedeleeuw/typescript-tooling`. After publication, use a versioned dependency. This repository does not publish automatically.

Use TypeScript 6 with the ESLint/parser compiler API (verified with TypeScript 6.0.3). TypeScript 7's published package does not provide that API. Oxlint's optional `oxlint-tsgolint` uses its own native compiler and is independent of the workspace compiler package.

## Native entrypoints

- `@joedeleeuw/typescript-tooling/tsconfig/base.json`: strict, portable compiler defaults; consumer owns `lib`, `jsx`, paths, includes and build output.
- `/prettier`: 2 spaces, 80 columns, double quotes, semicolons, ES5 trailing commas.
- `/eslint`: `createConfig({ tsconfigRootDir, projectService })` and `restrictedSyntax` (enums and React 19 forwardRef); includes SQL template safety. Compose with your framework and typed ESLint configs.
- `/oxlint`: `createConfig({ repoRoot, maxLines, typeAware })`, complexity 25 (modified), depth 4, parameters 7, no nested ternaries, file cap 1500, TS syntax/type-aware rules and lint-directive descriptions. `maxLines` is consumer-owned; the starter uses 1000. Type-aware rules are included when the consumer resolves `oxlint-tsgolint`; explicit `typeAware: true` fails if it is missing. `typescriptBaselineTier()` reports the effective tier.
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

## Maintenance and proof

`pnpm check` checks formatting, declarations and the actual packed package in separately installed consumers. Acceptance covers full and syntax-only TS tiers, real lint rejection, compiler strictness, formatting and dependency graph rejection. No npm publication or product deployment is part of this command.

Changing this dependency updates defaults in existing consumers. Changing the starter only helps newly created projects. Personal agent rules remain in dotfiles; checked-in project instructions and exceptions remain in each repository.
