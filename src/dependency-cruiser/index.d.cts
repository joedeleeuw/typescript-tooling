import type { IConfiguration, SeverityType } from "dependency-cruiser" with {
  "resolution-mode": "import",
};
export function createConfig(options?: {
  roots?: string;
  cycleSeverity?: SeverityType;
}): IConfiguration;
