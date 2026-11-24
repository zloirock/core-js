import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// Explicit pure imports supply their own call. An instance read on the returned value
// still needs its helper, for an import-equals alias just as for an ordinary import.
import _Array$from = require('@core-js/pure/actual/array/from');
import other = require('some-lib');
export const r = _atMaybeArray(_ref = _Array$from([1, 2])).call(_ref, 0);
export const q = _at(_ref2 = other([3])).call(_ref2, 0);
// the export wrapper / modifier changes nothing about the binding: an exported alias is the
// plugin's own too, on the TS spelling and on the require var alike
export import _Array$of = require('@core-js/pure/actual/array/of');
export const _Array$at = require('@core-js/pure/actual/array/at');
export const s = _atMaybeArray(_ref3 = _Array$of(1, 2)).call(_ref3, 0);
export function readElement(items) {
  var _ref4;
  return _at(_ref4 = _Array$at(items, 0)).call(_ref4, 0);
}
export const t = readElement([[4]]);