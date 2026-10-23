import { isAbsolute, matchesGlob, relative } from "node:path";

export const scopeProperties = {
  files: { type: "array", items: { type: "string" } },
  excludeFiles: { type: "array", items: { type: "string" } },
};

function scopePatterns(options, field) {
  if (typeof options !== "object" || options === null) {
    return undefined;
  }
  const patterns = Reflect.get(options, field);
  if (!Array.isArray(patterns)) {
    return undefined;
  }
  return patterns.filter((pattern) => typeof pattern === "string");
}

export function isRuleFile(context) {
  const [options] = context.options;
  const filename = context.filename.replaceAll("\\", "/");
  const local = isAbsolute(filename)
    ? relative(context.cwd, filename).replaceAll("\\", "/")
    : filename;
  const matches = (pattern) =>
    matchesGlob(local, pattern) || matchesGlob(filename, pattern);
  const files = scopePatterns(options, "files");
  const excludeFiles = scopePatterns(options, "excludeFiles") ?? [];
  return (
    (files === undefined || files.some(matches)) && !excludeFiles.some(matches)
  );
}
