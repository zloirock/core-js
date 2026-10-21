import _Array$from from "@core-js/pure/actual/array/from";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A retained effectful realm receiver keeps native destructuring and user fallback selection.
let c2 = 0;
let ks;
export const ofSynthKept = (({
  of
} = {}) => of)((ks = _globalThis.window)?.[c2++, 'self'].Array ?? {});
export { c2 };
let c3 = 0;
let ln;
export const logicalNoSynth = (_ref = (ln = _globalThis.window)?.[c3++, 'self'].Array ?? Array, _ref === Array ? _Array$from([1]) : _ref.from([1]));
const fallbackArray = makeArray();
let lu;
export const logicalUserFallback = ((lu = _globalThis.window)?.[c3++, 'self'].Array ?? fallbackArray).fromAsync([1]);
let tn;
export const ternaryNoSynth = (1 ? null == (tn = _globalThis.window) ? void 0 : _findLastMaybeArray(tn[c3++, 'self'].Array.prototype) : 0).call([1, 2], v => v < 2);
export { c3 };