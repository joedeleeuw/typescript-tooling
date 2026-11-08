import type { Linter } from "eslint";
import type { ParserOptions } from "@typescript-eslint/parser";

export const restrictedSyntax: readonly { selector: string; message: string }[];
export function createConfig(options?: {
  tsconfigRootDir?: string;
  projectService?: ParserOptions["projectService"];
  playwrightFiles?: readonly string[];
}): Linter.Config[];
export default createConfig;
