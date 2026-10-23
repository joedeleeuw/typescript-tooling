import confineOwner from "./stella/confine-owner.js";
import docsSourcePolicy from "./stella/docs-source-policy.js";
import iconButtonRequiresTooltip from "./stella/icon-button-requires-tooltip.js";
import noAdhocLoader from "./stella/no-adhoc-loader.js";
import noAmbientHotkeyFormat from "./stella/no-ambient-hotkey-format.js";
import noAsyncContextEnterWith from "./stella/no-async-context-enter-with.js";
import noAuthTokenInWebStorage from "./stella/no-auth-token-in-web-storage.js";
import noAwaitedBuilderUnion from "./stella/no-awaited-builder-union.js";
import noCenteredScrollColumn from "./stella/no-centered-scroll-column.js";
import noDialogTriggerMenuItem from "./stella/no-dialog-trigger-menu-item.js";
import noDisabledTooltipTrigger from "./stella/no-disabled-tooltip-trigger.js";
import noEagerSingleton from "./stella/no-eager-singleton.js";
import noInlineStyleColors from "./stella/no-inline-style-colors.js";
import noOmittedPropRespread from "./stella/no-omitted-prop-respread.js";
import noPartialRecordSatisfies from "./stella/no-partial-record-satisfies.js";
import noPathPrefixContainment from "./stella/no-path-prefix-containment.js";
import noPhysicalProperties from "./stella/no-physical-properties.js";
import noPortalUnderInteractiveAncestor from "./stella/no-portal-under-interactive-ancestor.js";
import noRawFilenameWrite from "./stella/no-raw-filename-write.js";
import noRawForegroundOpacity from "./stella/no-raw-foreground-opacity.js";
import noRedactedLogAttributeKey from "./stella/no-redacted-log-attribute-key.js";
import noSpreadInputInQueryKey from "./stella/no-spread-input-in-query-key.js";
import noStaticDevtoolsImport from "./stella/no-static-devtools-import.js";
import noUnformattedNumber from "./stella/no-unformatted-number.js";
import noUnsafeInnerHtml from "./stella/no-unsafe-inner-html.js";
import noUnsanitizedHref from "./stella/no-unsanitized-href.js";
import requireDetachedLabelShape from "./stella/require-detached-label-shape.js";
import requireDirOnRenderedName from "./stella/require-dir-on-rendered-name.js";
import requireExhaustivePanic from "./stella/require-exhaustive-panic.js";
import requireFetchTimeout from "./stella/require-fetch-timeout.js";
import requireFunctionReplacer from "./stella/require-function-replacer.js";
import requireQueryKeyFactory from "./stella/require-query-key-factory.js";
import requireQuerySignal from "./stella/require-query-signal.js";
import requireSafeWindowOpen from "./stella/require-safe-window-open.js";
import requireSecureDocumentResponse from "./stella/require-secure-document-response.js";
import requireStableSnapshot from "./stella/require-stable-snapshot.js";
import requireStreamReaderDisposal from "./stella/require-stream-reader-disposal.js";
import { noUnknownTypeAliasesRule } from "./anti-slop/no-unknown-type-aliases.js";
import noCallingComponentsAsFunctions from "./sentry/no-calling-components-as-functions.js";

export default {
  meta: { name: "tooling" },
  rules: {
    "confine-owner": confineOwner,
    "docs-source-policy": docsSourcePolicy,
    "icon-button-requires-tooltip": iconButtonRequiresTooltip,
    "no-adhoc-loader": noAdhocLoader,
    "no-ambient-hotkey-format": noAmbientHotkeyFormat,
    "no-async-context-enter-with": noAsyncContextEnterWith,
    "no-auth-token-in-web-storage": noAuthTokenInWebStorage,
    "no-awaited-builder-union": noAwaitedBuilderUnion,
    "no-centered-scroll-column": noCenteredScrollColumn,
    "no-dialog-trigger-menu-item": noDialogTriggerMenuItem,
    "no-disabled-tooltip-trigger": noDisabledTooltipTrigger,
    "no-eager-singleton": noEagerSingleton,
    "no-inline-style-colors": noInlineStyleColors,
    "no-omitted-prop-respread": noOmittedPropRespread,
    "no-partial-record-satisfies": noPartialRecordSatisfies,
    "no-path-prefix-containment": noPathPrefixContainment,
    "no-physical-properties": noPhysicalProperties,
    "no-portal-under-interactive-ancestor": noPortalUnderInteractiveAncestor,
    "no-raw-filename-write": noRawFilenameWrite,
    "no-raw-foreground-opacity": noRawForegroundOpacity,
    "no-redacted-log-attribute-key": noRedactedLogAttributeKey,
    "no-spread-input-in-query-key": noSpreadInputInQueryKey,
    "no-static-devtools-import": noStaticDevtoolsImport,
    "no-unformatted-number": noUnformattedNumber,
    "no-unsafe-inner-html": noUnsafeInnerHtml,
    "no-unsanitized-href": noUnsanitizedHref,
    "require-detached-label-shape": requireDetachedLabelShape,
    "require-dir-on-rendered-name": requireDirOnRenderedName,
    "require-exhaustive-panic": requireExhaustivePanic,
    "require-fetch-timeout": requireFetchTimeout,
    "require-function-replacer": requireFunctionReplacer,
    "require-query-key-factory": requireQueryKeyFactory,
    "require-query-signal": requireQuerySignal,
    "require-safe-window-open": requireSafeWindowOpen,
    "require-secure-document-response": requireSecureDocumentResponse,
    "require-stable-snapshot": requireStableSnapshot,
    "require-stream-reader-disposal": requireStreamReaderDisposal,
    "no-unknown-type-aliases": noUnknownTypeAliasesRule,
    "no-calling-components-as-functions": noCallingComponentsAsFunctions(),
  },
};
