import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _entries from "@core-js/pure/actual/instance/entries";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
// a `||` / `??` whose left is the pure import this build mints for a static (`Array.from`) always
// yields that static, so a call through the selection returns what the static returns. an import of
// it the user wrote, a const alias of the import and an import from another package decide nothing
import arrayOf from '@core-js/pure/actual/array/of';
import foreignFrom from 'my-lib/array/from';
function toArray(value) {
  return value;
}
export function minted(source) {
  var _ref;
  const from = _Array$from;
  return _atMaybeArray(_ref = from(source)).call(_ref, 0);
}
export function nullish(source) {
  var _ref2;
  const from = _Array$from;
  return _valuesMaybeArray(_ref2 = from(source)).call(_ref2);
}
export function written(item) {
  var _ref3;
  const of = arrayOf || toArray;
  return _entries(_ref3 = of(item)).call(_ref3);
}
const heldOf = arrayOf;
export function aliased(item) {
  var _ref4;
  const of = heldOf || toArray;
  return _includes(_ref4 = of(item)).call(_ref4, 1);
}
export function foreign(source) {
  var _ref5;
  const from = foreignFrom || toArray;
  return _keys(_ref5 = from(source)).call(_ref5);
}