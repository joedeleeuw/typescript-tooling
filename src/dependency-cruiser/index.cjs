function createConfig({
  roots = "(apps|packages)",
  cycleSeverity = "error",
} = {}) {
  return {
    forbidden: [
      {
        name: "no-circular",
        severity: cycleSeverity,
        from: {},
        to: { circular: true },
      },
      {
        name: "tests-folder-is-private",
        severity: "error",
        from: { pathNot: `^${roots}/([^/]+)/tests/` },
        to: { path: `^${roots}/[^/]+/tests/` },
      },
      {
        name: "other-package-tests-are-private",
        severity: "error",
        from: { path: `^(${roots}/[^/]+)/tests/` },
        to: { path: `^${roots}/[^/]+/tests/`, pathNot: "^$1/tests/" },
      },
    ],
    options: {
      doNotFollow: { path: "node_modules" },
      exclude: {
        path: ["node_modules", "_generated", "/dist/", "/\\.next/", "/out/"],
      },
      tsPreCompilationDeps: true,
      enhancedResolveOptions: {
        exportsFields: ["exports"],
        conditionNames: ["import", "require", "default", "types"],
      },
      reporterOptions: { text: { highlightFocused: true } },
    },
  };
}

module.exports = { createConfig };
