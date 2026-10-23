import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { vendoredRuleCases } from "./vendored-rule-cases.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const scratch = mkdtempSync(join(tmpdir(), "typescript-tooling-consumer-"));
const receipt = [];
console.log(`Packed consumer directory: ${scratch}`);

function run(cwd, command, args, expected = 0, diagnostic) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      NODE_ENV: "development",
      PATH: `${dirname(process.execPath)}:${process.env.PATH}`,
    },
    maxBuffer: 16 * 1024 * 1024,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  console.log(`${cwd}: ${command} ${args.join(" ")} => ${result.status}`);
  if (
    result.error ||
    result.status !== expected ||
    (diagnostic && !output.includes(diagnostic))
  ) {
    throw new Error(
      `${command} ${args.join(" ")} expected ${expected}, received ${result.status}\n${output}`,
      { cause: result.error }
    );
  }
  receipt.push({
    cwd,
    command: [command, ...args],
    exitCode: result.status,
    diagnostic,
    output,
  });
  return result.stdout;
}

function put(cwd, name, text) {
  const target = join(cwd, name);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text);
}

// Each vendored rule runs alone on its own invalid and valid file, through the
// plugin registration of the packed createConfig. Off-by-default rules are
// enabled here like the rest.
function proveVendoredRules(consumer) {
  const overrides = [];
  const expectations = [];
  for (const entry of vendoredRuleCases) {
    for (const [kind, code, options] of [
      ["invalid", entry.invalid, entry.options],
      ["valid", entry.valid, entry.validOptions ?? entry.options],
    ]) {
      const file = `vendored/${entry.rule}/${kind}/${entry.filename ?? "component.tsx"}`;
      put(consumer, file, `${code}\n`);
      const ruleOptions =
        entry.rule === "docs-source-policy"
          ? { ...options, policyFile: file }
          : options;
      overrides.push({
        files: [file],
        rules: {
          [`tooling/${entry.rule}`]:
            ruleOptions === undefined ? "error" : ["error", ruleOptions],
        },
      });
      expectations.push({
        file,
        codes: kind === "invalid" ? [`tooling(${entry.rule})`] : [],
      });
    }
  }
  put(
    consumer,
    "vendored.config.ts",
    `import { createConfig } from "@joedeleeuw/typescript-tooling/oxlint";\nconst { categories, jsPlugins } = createConfig({ repoRoot: import.meta.dirname });\nexport default { categories, jsPlugins, overrides: ${JSON.stringify(overrides)} };\n`
  );
  const { diagnostics } = JSON.parse(
    run(
      consumer,
      "pnpm",
      [
        "exec",
        "oxlint",
        "--config",
        "vendored.config.ts",
        "--format",
        "json",
        "vendored",
      ],
      1
    )
  );
  for (const { file, codes } of expectations) {
    const reported = diagnostics
      .filter((diagnostic) => diagnostic.filename === file)
      .map((diagnostic) => diagnostic.code);
    if (JSON.stringify(reported) !== JSON.stringify(codes)) {
      throw new Error(
        `${consumer}/${file}: expected ${JSON.stringify(codes)}, received ${JSON.stringify(reported)}`
      );
    }
  }
  if (diagnostics.length !== vendoredRuleCases.length) {
    throw new Error(
      `Vendored rules reported ${diagnostics.length} diagnostics for ${vendoredRuleCases.length} invalid files`
    );
  }
}

run(root, "pnpm", ["pack", "--pack-destination", scratch]);
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const tarball = join(
  scratch,
  `${manifest.name.replace(/^@/, "").replace("/", "-")}-${manifest.version}.tgz`
);
const packedFiles = new Set(
  run(scratch, "tar", ["-tzf", tarball]).split("\n").filter(Boolean)
);
for (const required of [
  "package/NOTICE",
  "package/licenses/Apache-2.0.txt",
  "package/licenses/Sentry-FSL-1.1-Apache-2.0.md",
  "package/src/oxlint-plugin/anti-slop/LICENSE",
]) {
  if (!packedFiles.has(required)) {
    throw new Error(`Packed artifact is missing ${required}`);
  }
}

for (const engine of [manifest.devDependencies.oxlint, "1.78.0"]) {
  for (const tier of ["syntax-only", "full"]) {
    const consumer = join(scratch, `${engine}-${tier}`);
    mkdirSync(consumer);
    const dependencies = {
      "@joedeleeuw/typescript-tooling": `file:${tarball}`,
      eslint: manifest.devDependencies.eslint,
      oxlint: engine,
      typescript: manifest.devDependencies.typescript,
      prettier: manifest.devDependencies.prettier,
      "dependency-cruiser": manifest.devDependencies["dependency-cruiser"],
      "@types/node": manifest.devDependencies["@types/node"],
      ...(tier === "full"
        ? { "oxlint-tsgolint": manifest.devDependencies["oxlint-tsgolint"] }
        : {}),
    };
    put(
      consumer,
      "package.json",
      JSON.stringify(
        {
          name: `packed-${tier}`,
          private: true,
          type: "module",
          devDependencies: dependencies,
        },
        null,
        2
      )
    );
    put(
      consumer,
      "pnpm-workspace.yaml",
      "packages:\n  - .\n\nallowBuilds: {}\n"
    );
    run(consumer, "pnpm", ["install", "--config.auto-install-peers=false"]);
    put(
      consumer,
      "tsconfig.json",
      JSON.stringify(
        {
          extends: "@joedeleeuw/typescript-tooling/tsconfig/base.json",
          compilerOptions: { noEmit: true, lib: ["ES2022"], types: ["node"] },
          include: ["src/**/*.ts"],
        },
        null,
        2
      )
    );
    put(
      consumer,
      "oxlint.config.ts",
      'import { createConfig } from "@joedeleeuw/typescript-tooling/oxlint";\nexport default createConfig({repoRoot: import.meta.dirname});\n'
    );
    put(
      consumer,
      "eslint.config.mjs",
      'import { createConfig } from "@joedeleeuw/typescript-tooling/eslint";\nexport default createConfig({tsconfigRootDir: import.meta.dirname});\n'
    );
    put(
      consumer,
      "prettier.config.mjs",
      'import config from "@joedeleeuw/typescript-tooling/prettier";\nexport default config;\n'
    );
    put(
      consumer,
      ".dependency-cruiser.cjs",
      'const {createConfig} = require("@joedeleeuw/typescript-tooling/dependency-cruiser");\nmodule.exports = createConfig();\n'
    );
    put(
      consumer,
      "src/valid.ts",
      "export const greeting = (name: string) => `Hello, ${name}.`;\n"
    );
    run(consumer, "node", [
      "--input-type=module",
      "--eval",
      `import {typescriptBaselineTier} from '@joedeleeuw/typescript-tooling/oxlint'; if(typescriptBaselineTier(process.cwd()) !== '${tier}') throw new Error('wrong tier'); console.log('${tier}');`,
    ]);
    run(consumer, "pnpm", ["exec", "tsc", "--noEmit"]);
    put(
      consumer,
      "native.mts",
      'import {createConfig as graph} from "@joedeleeuw/typescript-tooling/dependency-cruiser";\nimport {complexityRules,typescriptSyntaxRules,createConfig as oxlint} from "@joedeleeuw/typescript-tooling/oxlint";\nimport {createConfig as eslint} from "@joedeleeuw/typescript-tooling/eslint";\nimport prettier from "@joedeleeuw/typescript-tooling/prettier";\nimport {defineConfig} from "oxlint";\ndefineConfig({rules:{...complexityRules,...typescriptSyntaxRules}});\nconst cap:25=complexityRules.complexity[1].max;\ngraph({cycleSeverity:"warn"});oxlint();eslint();console.log(cap,prettier);\n'
    );
    put(
      consumer,
      "native.cts",
      'import {createConfig} from "@joedeleeuw/typescript-tooling/dependency-cruiser";\ncreateConfig({cycleSeverity:"error"});\n'
    );
    for (const mode of ["NodeNext", "Node18"]) {
      run(consumer, "pnpm", [
        "exec",
        "tsc",
        "--noEmit",
        "--ignoreConfig",
        "--skipLibCheck",
        "false",
        "--module",
        mode,
        "--target",
        "ES2022",
        "--strict",
        "--types",
        "node",
        "native.mts",
        "native.cts",
      ]);
    }
    run(consumer, "node", [
      "--input-type=module",
      "--eval",
      'import {createAdoptionOxlintConfig} from "@joedeleeuw/typescript-tooling/oxlint";for(const presets of [[],["missing"]]){let rejected=false;try{createAdoptionOxlintConfig({presets});}catch(error){rejected=error instanceof TypeError;}if(!rejected)throw new Error("invalid adoption selection accepted");}',
    ]);
    run(consumer, "pnpm", ["exec", "oxlint", "src/valid.ts"]);
    run(consumer, "pnpm", [
      "exec",
      "eslint",
      "src/valid.ts",
      "--max-warnings=0",
    ]);
    run(consumer, "pnpm", ["exec", "prettier", "--check", "src/valid.ts"]);
    put(
      consumer,
      "src/syntax.ts",
      "export function identity(value: any) { return value; }\n"
    );
    run(
      consumer,
      "pnpm",
      ["exec", "oxlint", "src/syntax.ts"],
      1,
      "no-explicit-any"
    );
    put(
      consumer,
      "src/nested.ts",
      'export const sign = (count: number) => (count > 0 ? "up" : count < 0 ? "down" : "flat");\n'
    );
    run(
      consumer,
      "pnpm",
      ["exec", "oxlint", "src/nested.ts"],
      1,
      "no-nested-ternary"
    );
    put(
      consumer,
      "src/typed.ts",
      'export const parsed: string = JSON.parse("42");\n'
    );
    run(
      consumer,
      "pnpm",
      ["exec", "oxlint", "src/typed.ts"],
      tier === "full" ? 1 : 0,
      tier === "full" ? "no-unsafe-assignment" : undefined
    );
    put(
      consumer,
      "src/anemic.ts",
      'export function fail(): never {\n  throw new Error("Something went wrong");\n}\n'
    );
    run(
      consumer,
      "pnpm",
      ["exec", "oxlint", "src/anemic.ts"],
      1,
      "rikalabs(no-anemic-errors)"
    );
    put(consumer, "src/payload.ts", "export type Payload = unknown;\n");
    run(
      consumer,
      "pnpm",
      ["exec", "oxlint", "src/payload.ts"],
      1,
      "tooling(no-unknown-type-aliases)"
    );
    proveVendoredRules(consumer);
    put(consumer, "src/enum.ts", "export enum State { Ready }\n");
    run(
      consumer,
      "pnpm",
      ["exec", "eslint", "src/enum.ts"],
      1,
      "no-restricted-syntax"
    );
    put(
      consumer,
      "src/forward-ref.ts",
      "declare function forwardRef(value: unknown): unknown;\nexport const component = forwardRef({});\n"
    );
    run(
      consumer,
      "pnpm",
      ["exec", "eslint", "src/forward-ref.ts"],
      1,
      "forwardRef is deprecated"
    );
    put(
      consumer,
      "src/sql.ts",
      'const id = "one";\nexport const query = `SELECT * FROM users WHERE id = ${id}`;\n'
    );
    run(
      consumer,
      "pnpm",
      ["exec", "eslint", "src/sql.ts"],
      1,
      "sql-template/no-unsafe-query"
    );
    put(
      consumer,
      "src/for-each.ts",
      "declare const items: string[];\ndeclare function save(item: string): Promise<void>;\nexport function saveAll() {\n  items.forEach(async (item) => { await save(item); });\n}\n"
    );
    run(
      consumer,
      "pnpm",
      ["exec", "eslint", "src/for-each.ts"],
      1,
      "forEach does not wait for async callbacks"
    );
    put(
      consumer,
      "src/for-of.ts",
      "declare const items: string[];\ndeclare function save(item: string): Promise<void>;\nexport async function saveAll() {\n  for (const item of items) {\n    await save(item);\n  }\n}\n"
    );
    run(consumer, "pnpm", ["exec", "eslint", "src/for-of.ts"]);
    put(consumer, "src/strict.ts", "export const value: string = undefined;\n");
    run(
      consumer,
      "pnpm",
      ["exec", "tsc", "--noEmit"],
      2,
      "Type 'undefined' is not assignable to type 'string'"
    );
    put(
      consumer,
      "packages/domain/src/index.ts",
      'export const label = "ready";\n'
    );
    put(
      consumer,
      "apps/web/src/index.ts",
      'import { label } from "../../../packages/domain/src/index.ts";\nexport { label };\n'
    );
    run(consumer, "pnpm", [
      "exec",
      "depcruise",
      "--config",
      ".dependency-cruiser.cjs",
      "apps",
      "packages",
    ]);
    put(
      consumer,
      "packages/domain/tests/private.ts",
      'export const secret = "test-only";\n'
    );
    put(
      consumer,
      "packages/domain/tests/own.ts",
      'export {secret} from "./private.ts";\n'
    );
    run(consumer, "pnpm", [
      "exec",
      "depcruise",
      "--config",
      ".dependency-cruiser.cjs",
      "apps",
      "packages",
    ]);
    put(
      consumer,
      "apps/web/tests/foreign.ts",
      'export {secret} from "../../../packages/domain/tests/private.ts";\n'
    );
    run(
      consumer,
      "pnpm",
      [
        "exec",
        "depcruise",
        "--config",
        ".dependency-cruiser.cjs",
        "apps",
        "packages",
      ],
      1,
      "other-package-tests-are-private"
    );
    put(
      consumer,
      "apps/web/tests/foreign.ts",
      'export const label = "clean";\n'
    );
    put(
      consumer,
      "apps/web/src/private.ts",
      'export { secret } from "../../../packages/domain/tests/private.ts";\n'
    );
    run(
      consumer,
      "pnpm",
      [
        "exec",
        "depcruise",
        "--config",
        ".dependency-cruiser.cjs",
        "apps",
        "packages",
      ],
      1,
      "tests-folder-is-private"
    );
    put(
      consumer,
      "cycles/a.ts",
      'export { b } from "./b.ts";\nexport const a = 1;\n'
    );
    put(
      consumer,
      "cycles/b.ts",
      'export { a } from "./a.ts";\nexport const b = 2;\n'
    );
    run(
      consumer,
      "pnpm",
      ["exec", "depcruise", "--config", ".dependency-cruiser.cjs", "cycles"],
      1,
      "no-circular"
    );
    put(consumer, "bad-format.ts", "export const value='value'\n");
    run(
      consumer,
      "pnpm",
      ["exec", "prettier", "--check", "bad-format.ts"],
      1,
      "Code style issues"
    );
  }
}

const reports = join(root, "reports");
mkdirSync(reports, { recursive: true });
writeFileSync(
  join(reports, "packed-consumer.json"),
  JSON.stringify({ receipt }, null, 2)
);
rmSync(scratch, { recursive: true, force: true });
console.log(
  `Packed consumer acceptance passed; ${receipt.length} commands. Receipt: ${join(reports, "packed-consumer.json")}`
);
