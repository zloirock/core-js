import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// proxy-global chain through a TS `as` mid-chain wrapper. resolveProxyGlobalChainSrc must
// peel TS_EXPR_WRAPPERS between hops to reach the `globalThis` leaf for substitution;
// otherwise the receiver retains raw `globalThis` and IE11 ReferenceErrors on the
// implicit lookup before the polyfill ever fires.
_at(_ref = _globalThis.X.Y)?.call(_ref, 0);