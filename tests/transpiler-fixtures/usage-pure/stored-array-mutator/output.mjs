import _unshiftMaybeArray from "@core-js/pure/actual/array/instance/unshift";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
const holder = {
  rows: ['word']
};
_unshiftMaybeArray(_ref = holder.rows).call(_ref, [7]);
export const first = _at(_ref2 = holder.rows[0]).call(_ref2, 0);