import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Math$fround from "@core-js/pure/actual/math/fround";
import _Reflect$getPrototypeOf from "@core-js/pure/actual/reflect/get-prototype-of";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A write the census sees withdraws the decision - the slot may hold the user's value - so the selection
// keeps both operands, each polyfilled in place: a global core-js patches in place (`Number` off the realm, a
// bare `Array`) and a static (`Math.sumPrecise`) alike, and a key both operands own mirrors the right's static
// (`Reflect.getPrototypeOf`); a patched STATIC of the global the left reads leaves the decision standing, the
// selection folds to its left, and the static's read stays native.
if (legacy) Number = MyNumber;
export const integer = (_globalThis.Number || _WeakSet).isInteger(1);
Array = makeArray();
export const listed = (Array || _Iterator).from(list);
Math.sumPrecise = null;
export const summed = (Math.sumPrecise || _Math$fround)([1, 2]);
Object = makeObject();
export const {
  getPrototypeOf
} = Object || {
  getPrototypeOf: _Reflect$getPrototypeOf
};
RegExp.escape = myEscape;
export const escaped = _globalThis.RegExp.escape('a.b');