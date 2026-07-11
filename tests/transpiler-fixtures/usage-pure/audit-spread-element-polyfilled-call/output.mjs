import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// a polyfilled call hosted by a SpreadElement - array-literal element and call-argument
// positions. the rewrite composes INSIDE the spread; a call-rooted receiver memoizes
// without disturbing the surrounding `...`
const arr = [1, [2]];
export const a = [..._flatMaybeArray(arr).call(arr)];
function f(...xs) {
  return xs;
}
export const b = f(..._atMaybeString(_ref = 'abc').call(_ref, 0));