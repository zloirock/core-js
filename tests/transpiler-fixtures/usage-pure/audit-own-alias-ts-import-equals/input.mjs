// Explicit pure imports supply their own call. An instance read on the returned value
// still needs its helper, for an import-equals alias just as for an ordinary import.
import _Array$from = require('@core-js/pure/actual/array/from');
import other = require('some-lib');
export const r = _Array$from([1, 2]).at(0);
export const q = other([3]).at(0);
// the export wrapper / modifier changes nothing about the binding: an exported alias is the
// plugin's own too, on the TS spelling and on the require var alike
export import _Array$of = require('@core-js/pure/actual/array/of');
export const _Array$at = require('@core-js/pure/actual/array/at');
export const s = _Array$of(1, 2).at(0);
export function readElement(items) {
  return _Array$at(items, 0).at(0);
}
export const t = readElement([[4]]);
