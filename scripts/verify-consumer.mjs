import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
  return output;
}

function put(cwd, name, text) {
  const target = join(cwd, name);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text);
}

run(root, "pnpm", ["pack", "--pack-destination", scratch]);
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const tarball = join(
  scratch,
  `${manifest.name.replace(/^@/, "").replace("/", "-")}-${manifest.version}.tgz`
);

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
  JSON.stringify({ scratch, tarball, receipt }, null, 2)
);
console.log(
  `Packed consumer acceptance passed; ${receipt.length} commands. Receipt: ${join(reports, "packed-consumer.json")}`
);
