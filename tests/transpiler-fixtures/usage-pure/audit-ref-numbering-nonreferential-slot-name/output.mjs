import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2, _ref3;
// Literal keys, a key on a call result and a label leave the first temporary available.
function call() {
  return {};
}
const objKey = {
  _ref: 1
};
export const r1 = _atMaybeArray(_ref = [10, 20]).call(_ref, 0);
call()._ref;
export const r2 = _flatMaybeArray(_ref2 = [[1], [2]]).call(_ref2);
_ref: for (const v of [1, 2]) {
  if (v) break _ref;
}
export const r3 = _includesMaybeArray(_ref3 = [3, 4]).call(_ref3, 3);
const importKey = {
  _Array$from: 1
};
export const r4 = _Array$from([5, 6]);
export { objKey, importKey };