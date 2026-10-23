// Invalid and valid snippets for each rule in src/oxlint-plugin. They are
// ported from antidrift 048a392: test/portable-cases.mjs for the stella rules,
// src/oxlint-plugin/index.test.mjs for no-unknown-type-aliases and
// src/eslint-plugin/react-and-local-control.test.mjs for
// no-calling-components-as-functions. Files default to component.tsx; options
// apply to both snippets unless validOptions is given.

export const vendoredRuleCases = [
  {
    rule: "confine-owner",
    options: {
      entries: [
        {
          id: "storage",
          owner: ["src/storage.ts"],
          enforcement: {
            kind: "import",
            specifiers: ["storage-sdk"],
          },
        },
      ],
    },
    invalid: 'import { client } from "storage-sdk";',
    valid: 'import { store } from "./storage";',
  },
  {
    rule: "docs-source-policy",
    options: {
      dependencies: ["react"],
      sources: {},
      policyFile: "docs-sources.mjs",
    },
    invalid: "export const documentation = {};",
    valid: "export const documentation = {};",
    validOptions: {
      dependencies: ["react"],
      sources: {
        react: {
          url: "https://react.dev/llms.txt",
          dependencies: ["react"],
        },
      },
    },
    filename: "docs-sources.mjs",
  },
  {
    rule: "icon-button-requires-tooltip",
    invalid: '<Button size="icon"><PlusIcon /></Button>;',
    valid:
      '<Tooltip><TooltipTrigger><Button size="icon"><PlusIcon /></Button></TooltipTrigger><TooltipContent>Add</TooltipContent></Tooltip>;',
  },
  {
    rule: "no-adhoc-loader",
    invalid: '<div className="animate-spin" />;',
    valid: "<Loader />;",
  },
  {
    rule: "no-ambient-hotkey-format",
    invalid: 'import { detectPlatform } from "@tanstack/hotkeys";',
    valid: 'import { formatHotkeyForPlatform } from "./hotkeys";',
  },
  {
    rule: "no-async-context-enter-with",
    invalid:
      'import { AsyncLocalStorage } from "node:async_hooks"; const storage = new AsyncLocalStorage(); storage.enterWith(value);',
    valid:
      'import { AsyncLocalStorage } from "node:async_hooks"; const storage = new AsyncLocalStorage(); storage.run(value, execute);',
  },
  {
    rule: "no-auth-token-in-web-storage",
    invalid: 'localStorage.setItem("access_token", token);',
    valid: 'localStorage.setItem("theme", "dark");',
  },
  {
    rule: "no-awaited-builder-union",
    invalid:
      "async function build() { return await (condition ? query.limit(1) : query); }",
    valid: "async function build() { return await factory(); }",
  },
  {
    rule: "no-centered-scroll-column",
    invalid: '<div className="mx-auto max-w-lg overflow-y-auto" />;',
    valid:
      '<div className="overflow-y-auto"><main className="mx-auto max-w-lg" /></div>;',
  },
  {
    rule: "no-dialog-trigger-menu-item",
    invalid:
      "<DialogTrigger><DropdownMenuItem>Open</DropdownMenuItem></DialogTrigger>;",
    valid: "<DropdownMenuItem onSelect={openDialog}>Open</DropdownMenuItem>;",
  },
  {
    rule: "no-disabled-tooltip-trigger",
    invalid:
      "<TooltipTrigger render={<Button disabled />}>Save</TooltipTrigger>;",
    valid:
      "<TooltipTrigger><span><button disabled>Save</button></span></TooltipTrigger>;",
  },
  {
    rule: "no-eager-singleton",
    invalid: "const storage = new S3Client({});",
    valid: "function storage() { return new S3Client({}); }",
  },
  {
    rule: "no-inline-style-colors",
    invalid:
      '<View style={{ flex: 1, backgroundColor: "rgb(255 255 255)" }} />;',
    valid: "<View style={{ flex: 1, backgroundColor: colors.surface }} />;",
  },
  {
    rule: "no-omitted-prop-respread",
    invalid:
      'type Props = Omit<ButtonProps, "disabled">; function Action(props: Props) { return <Button {...props} />; }',
    valid:
      'type Props = Omit<ButtonProps, "disabled">; function Action(props: Props) { return <Button {...props} disabled={false} />; }',
  },
  {
    rule: "no-partial-record-satisfies",
    invalid:
      'const labels = { ready: "Ready" } satisfies Partial<Record<State, string>>;',
    valid: 'const labels: Partial<Record<State, string>> = { ready: "Ready" };',
  },
  {
    rule: "no-path-prefix-containment",
    invalid:
      'import { resolve } from "node:path"; const target = resolve(root, name); if (target.startsWith(root)) read(target);',
    valid:
      'import { relative, isAbsolute } from "node:path"; const child = relative(root, target); if (!child.startsWith("..") && !isAbsolute(child)) read(target);',
  },
  {
    rule: "no-physical-properties",
    invalid: '<View className="ml-2 border-l pl-1" />;',
    valid: '<View className="ms-2 border-s ps-1" />;',
  },
  {
    rule: "no-portal-under-interactive-ancestor",
    invalid: "<button><DialogContent>Content</DialogContent></button>;",
    valid: "<><button>Open</button><DialogContent>Content</DialogContent></>;",
  },
  {
    rule: "no-raw-filename-write",
    invalid: "const row = { fileName: part.filename };",
    valid: "const row = { fileName: sanitizeFilename(part.filename) };",
  },
  {
    rule: "no-raw-foreground-opacity",
    invalid: '<p className="text-foreground/50" />;',
    valid: '<p className="text-muted-foreground" />;',
  },
  {
    rule: "no-redacted-log-attribute-key",
    invalid: 'logger.info("saved", { queueName: value });',
    valid: 'logger.info("saved", { recordId: value });',
  },
  {
    rule: "no-spread-input-in-query-key",
    invalid: 'const options = { queryKey: ["search", { ...input }] };',
    valid: 'const queryKey = ["search", input.term];',
  },
  {
    rule: "no-static-devtools-import",
    invalid:
      'import { ReactQueryDevtools } from "@tanstack/react-query-devtools";',
    valid: 'const devtools = () => import("@tanstack/react-query-devtools");',
  },
  {
    rule: "no-unformatted-number",
    invalid: "<Text>{attachments.length} selected</Text>;",
    valid: "<Text>{formatter.number(attachments.length)} selected</Text>;",
  },
  {
    rule: "no-unsafe-inner-html",
    invalid: "<div dangerouslySetInnerHTML={{ __html: content }} />;",
    valid: "<div>{content}</div>;",
  },
  {
    rule: "no-unsanitized-href",
    invalid: "<a href={input.url}>Open</a>;",
    valid:
      'import { sanitizeHref as safe } from "./url-policy"; <a href={safe(external)} />;',
    options: {
      sanitizers: [
        {
          module: "./url-policy",
          export: "sanitizeHref",
        },
      ],
    },
  },
  {
    rule: "require-detached-label-shape",
    invalid: 'detached(save(), "save");',
    valid: 'detached(save(), "storage.save");',
  },
  {
    rule: "require-dir-on-rendered-name",
    invalid: "<Text>{project.displayName}</Text>;",
    valid: "<BidiText>{project.displayName}</BidiText>;",
  },
  {
    rule: "require-exhaustive-panic",
    invalid:
      "function select(value) { const exhaustive: never = value; return exhaustive; }",
    valid:
      "function select(value) { const exhaustive: never = value; throw new Error(`Unsupported: ${exhaustive}`); }",
  },
  {
    rule: "require-fetch-timeout",
    invalid:
      'const upstream = await fetch(upstreamUrl, { method: "GET", cache: "no-store" });',
    valid: "const upstream = await fetch(upstreamUrl, { signal });",
  },
  {
    rule: "require-function-replacer",
    invalid: "next = current.replace(edit.oldString, edit.newString);",
    valid: "next = current.replace(edit.oldString, () => edit.newString);",
  },
  {
    rule: "require-query-key-factory",
    invalid:
      'queryClient.invalidateQueries({ queryKey: ["agent-config", baseURL] });',
    valid:
      "queryClient.invalidateQueries({ queryKey: queryKeys.agentConfig(baseURL) });",
  },
  {
    rule: "require-query-signal",
    invalid:
      'const options = { queryKey: ["users"], queryFn: async () => fetch(url) };',
    valid:
      'const options = { queryKey: ["users"], queryFn: async ({ signal }) => fetch(url, { signal }) };',
  },
  {
    rule: "require-safe-window-open",
    invalid:
      'window.open(conversationUrl(projectId, row.conversationId), "_blank");',
    valid:
      "openIsolatedWindow(conversationUrl(projectId, row.conversationId));",
  },
  {
    rule: "require-secure-document-response",
    invalid:
      'new Response(body, { headers: { "Content-Disposition": "attachment; filename=file.txt" } });',
    valid: "secureDocumentResponse(body);",
  },
  {
    rule: "require-stable-snapshot",
    invalid:
      'import { useSyncExternalStore } from "react"; useSyncExternalStore(subscribe, () => ({ value: store.value }));',
    valid:
      'import { useSyncExternalStore } from "react"; useSyncExternalStore(subscribe, () => store.snapshot);',
  },
  {
    rule: "require-stream-reader-disposal",
    invalid:
      "async function chunks(stream: ReadableStream) { const reader = stream.getReader(); const result = await reader.read(); return result; }",
    valid:
      "async function chunks(stream: ReadableStream) { const reader = stream.getReader(); try { return await reader.read(); } finally { try { await reader.cancel(); } finally { reader.releaseLock(); } } }",
  },
  {
    rule: "no-unknown-type-aliases",
    invalid: "type Payload = unknown;",
    valid: "type Payload = { id: string };",
  },
  {
    rule: "no-calling-components-as-functions",
    invalid: "function Widget() { return <div />; } Widget({ label: 'x' });",
    valid: "function Widget() { return null; } Widget({ label: 'x' });",
  },
];
