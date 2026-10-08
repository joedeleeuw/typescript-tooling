import type { Linter } from "eslint";
import type { ParserOptions } from "@typescript-eslint/parser";
export const restrictedSyntax: readonly { selector: string; message: string }[];
export function createConfig(options?: {
  tsconfigRootDir?: string;
  projectService?: ParserOptions["projectService"];
}): Linter.Config[];
export default createConfig;
