import type { DummyRuleMap, OxlintConfig } from "oxlint";
export const complexityRules: Readonly<{
  complexity: ["error", Readonly<{ max: 25; variant: "modified" }>];
  "max-depth": ["error", 4];
  "max-params": ["error", Readonly<{ max: 7 }>];
  "no-nested-ternary": "error";
}>;
export const typescriptSyntaxRules: Readonly<DummyRuleMap>;
export const typescriptTypeAwareRules: Readonly<DummyRuleMap>;
export function typescriptBaselineTier(
  repoRoot?: string
): "full" | "syntax-only";
export function createConfig(options?: {
  repoRoot?: string;
  maxLines?: number;
  typeAware?: boolean;
  enforceNoPropertyDefaultFallbacks?: boolean;
  propertyDefaultAllowedFiles?: readonly string[];
  enforceNoDerivedStateEffects?: boolean;
}): OxlintConfig;
export default createConfig;
export type AdoptionPresetName =
  | "eslint"
  | "import"
  | "jsdoc"
  | "node"
  | "oxc"
  | "promise"
  | "react"
  | "typescript"
  | "unicorn"
  | "vitest"
  | "jsx-a11y";
export const adoptionPresets: Readonly<
  Record<AdoptionPresetName, Readonly<DummyRuleMap>>
>;
export function createAdoptionOxlintConfig(options: {
  presets: readonly AdoptionPresetName[];
}): OxlintConfig;
