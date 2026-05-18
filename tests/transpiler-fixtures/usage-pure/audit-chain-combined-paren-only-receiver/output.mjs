import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// Paren-only wrapped chain receiver: `(globalThis).flat?.().includes(1)` - no TS, just
// parenthesization. `markWrappedProxyGlobalSkipped` peels both Paren and TS wrappers via
// the same loop, so the inner `globalThis` Identifier is suppressed and the chain emit
// uses the receiver text verbatim
null == _globalThis || null == (_ref = _flatMaybeArray(_globalThis)) ? void 0 : _includes(_ref2 = _ref.call(_globalThis)).call(_ref2, 1);