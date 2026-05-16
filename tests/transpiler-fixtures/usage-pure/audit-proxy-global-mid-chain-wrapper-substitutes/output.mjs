import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Proxy-global chain with mid-chain wrapper: `(globalThis?.X).Y.at?.(0)`. usage-pure
// must substitute the `globalThis` leaf with the polyfilled binding so the call site
// doesn't reference the raw global (engines without `globalThis` ReferenceError on it).
// without descending past the paren wrap mid-chain, the chain-substituter bails and
// emits raw `globalThis?.X` verbatim in the receiver slot.
_at(_ref = _globalThis.X.Y)?.call(_ref, 0);