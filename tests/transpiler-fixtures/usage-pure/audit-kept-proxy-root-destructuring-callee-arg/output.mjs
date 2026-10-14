import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a kept store over an effect-keyed proxy chain, handed to a callee that destructures it: the argument
// becomes a literal of the claimed statics, so the hop collapse yields to that claim and the key runs once.
// NEGATIVES where no callee destructures the value - a ternary carrier, a `??` over the same global, a
// `??` over a user binding - keep the collapse; the user fallback takes the identity guard instead.
let c2 = 0;
let ks;
export const ofSynthKept = (({
  of
} = {}) => of)((null == (ks = _globalThis.window) ? void 0 : (c2++, {
  of: _Array$of
})) ?? {});
export { c2 };
let c3 = 0;
let ln;
export const logicalNoSynth = ((ln = _globalThis.window)?.[c3++, "Array"] ?? Array, _Array$from)([1]);
const fallbackArray = makeArray();
let lu;
export const logicalUserFallback = (_ref = (lu = _globalThis.window)?.[c3++, "Array"] ?? fallbackArray, _ref === Array ? _Array$fromAsync([1]) : _ref.fromAsync([1]));
let tn;
export const ternaryNoSynth = (1 ? null == (tn = _globalThis.window) ? void 0 : _findLastMaybeArray(tn[c3++, "Array"].prototype) : 0).call([1, 2], v => v < 2);
export { c3 };