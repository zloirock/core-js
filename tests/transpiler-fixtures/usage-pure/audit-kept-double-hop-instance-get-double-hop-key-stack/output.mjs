import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref;
let k = 0;
// STACKED computed key-SE: the outer key evaluates AFTER the full inner receiver (ECMA
// receiver-before-key), so the inner rewrite's memo hoists ahead of the outer folded SE
let v;
export const doubleHopKeyStack = null == (v = _globalThis.window) ? void 0 : (_ref = (k++, _nameMaybeFunction(_Map)), k += 10, _at(_ref).call(_ref, 0));