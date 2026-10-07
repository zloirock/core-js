import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _String$raw from "@core-js/pure/actual/string/raw";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// A member read off a selection the build does not decide - an opaque operand, a realm read of a global
// core-js does not fill - keeps the selection, captured once, and an arm naming a constructor core-js ships no
// replacement of takes its static through the identity guard, the call riding each branch; an arm swapped
// whole reads its own statics (`Promise`), and a name a local binding shadows is the user's value
const list = [1, 2];
export const viaOr = (_ref = shim || Array, _ref === Array ? _Array$from(list) : _ref.from(list));
export const viaConditional = (_ref2 = flag ? Number : user, _ref2 === Number ? _Number$isInteger(7) : _ref2.isInteger(7));
export const viaNullish = (_ref3 = source ?? Object, _ref3 === Object ? _Object$fromEntries([['k', 1]]) : _ref3.fromEntries([['k', 1]]));
export const viaRealmLeft = (_ref4 = _globalThis.WeakRef || Array, _ref4 === Array ? _Array$of(3) : _ref4.of(3));
export const readOnly = (_ref5 = shim || String, _ref5 === String ? _String$raw : _ref5.raw);
let effects = 0;
export const effectOnce = (_ref6 = shim || (effects++, Math), _ref6 === Math ? _Math$sumPrecise(list) : _ref6.sumPrecise(list));
export const optionalCall = (_ref7 = source ?? Object, _ref7 === Object ? _Object$groupBy(list, x => x) : _ref7.groupBy?.(list, x => x));
export const swappedArm = (shim || _Promise).withResolvers();
export function shadowed(Object) {
  return (shim || Object).hasOwn({}, 'k');
}