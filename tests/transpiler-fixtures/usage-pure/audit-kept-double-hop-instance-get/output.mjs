import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
// a DOUBLE proxy hop under a kept assignment with an instance-GET tail: the erase-refusal claim
// fires INSIDE outer instance wrappers already built over the member, so the guard must climb
// above the whole wrapper stack - guarding only the wrapper's argument would hand `void 0` to the
// helper (a throw where native short-circuits the chain). a plugin helper wrap, its memoized
// dispatch and the optional-call spelling all lift; a USER consumer of the claim does not (it
// legitimately receives the short-circuited value)
let n;
let t;
let c;
let u;
let s;
let k = 0;
export const doubleHopName = null == (_ref = n = _globalThis.window) ? void 0 : _nameMaybeFunction(_Set);
export const doubleHopCallTail = null == (_ref2 = t = _globalThis.window) ? void 0 : _at(_ref3 = _nameMaybeFunction(_Map)).call(_ref3, 0);
export const doubleHopOptCall = null == (_ref4 = c = _globalThis.window) ? void 0 : _at(_ref5 = _nameMaybeFunction(_WeakMap))?.call(_ref5, 0);
export function keep(x) {
  return x;
}
export const userConsumer = keep(null == (u = _globalThis.window) ? void 0 : _Set);
// a computed key-SE rides the guard's non-null branch (native evaluates the key only when the
// chain does not short-circuit), ordered after the claim like the source reads it
export const doubleHopKeySe = null == (_ref6 = s = _globalThis.window) ? void 0 : (k++, _nameMaybeFunction(_Set));
// STACKED computed key-SE: the outer key evaluates AFTER the full inner receiver (ECMA
// receiver-before-key), so the inner rewrite's memo hoists ahead of the outer folded SE
let v;
export const doubleHopKeyStack = null == (_ref7 = v = _globalThis.window) ? void 0 : (_ref8 = (k++, _nameMaybeFunction(_Map)), k += 10, _at(_ref8).call(_ref8, 0));
// a user-written sequence stays put - only plugin-built wrappers lift into the guard
export function readName(x) {
  return k++, _nameMaybeFunction(x);
}