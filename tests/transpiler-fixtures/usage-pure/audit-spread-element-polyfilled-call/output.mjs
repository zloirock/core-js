import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a polyfilled call hosted by a SpreadElement - array-literal element and call-argument
// positions. The readonly binding and string literal need no receiver snapshot,
// and both call results stay inside their surrounding spread.
const arr = [1, [2]];
export const a = [..._flatMaybeArray(arr).call(arr)];
function f(...xs) {
  return xs;
}
export const b = f(..._atMaybeString('abc').call('abc', 0));