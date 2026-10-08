# TypeScript tooling

This repository owns reusable, tool-native TypeScript, ESLint, Oxlint, Prettier and dependency-cruiser configuration. It has no dependency on Antidrift or an application framework.

- Keep project paths, package-layer allowlists, environment variables and existing-debt ratchets in consumers.
- Expose only declared package subpaths. No compatibility aliases, config interpreter, wrapper CLI or generated agent machinery.
- Preserve rule meaning when extracting or changing defaults. Document intentional enforcement changes and version them.
- Verify the actual `pnpm pack` artifact in an independently installed consumer, including positive code and rejected violations. Workspace imports alone are not acceptance.
- Use Node 24 and pnpm. Run `pnpm check` before landing. Never publish without explicit owner instruction.
- Prefer real artifact/consumer smoke over unit tests or checked-in fixtures. Do not add unit tests.
- Maintain this file and CLAUDE.md as repository-owned files. Personal/global guidance stays in dotfiles.
- Record substantive ownership and validation findings in the dated docs/field-notes file. Preserve unrelated work and never bypass hooks.
