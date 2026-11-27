import _unshiftMaybeArray from "@core-js/pure/actual/array/instance/unshift";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
const holder = {
  rows: ['word']
};
const rows = holder.rows;
_unshiftMaybeArray(rows).call(rows, [7]);
export const first = _at(_ref = holder.rows[0]).call(_ref, 0);