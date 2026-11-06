import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// `((globalThis as any).X).Y.at?.(0)` - a TS `as` cast sits mid-chain. The cast is peeled
// to reach the globalThis root so it is substituted to the polyfill; otherwise the receiver
// keeps a bare globalThis that ReferenceErrors in engines lacking it before the polyfill runs.
_at(_ref = _globalThis.X.Y)?.call(_ref, 0);