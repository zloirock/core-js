import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Bodyless computed-key destructures evaluate the receiver once and extract properties in order.
// Instance parameter defaults retain their receiver-read limits. Nested defaults belong to their
// own receiver slot in declarations, assignments and catch parameters.
const log = [];
const cond = true;
export const a2 = (() => {
  if (cond) var _ref = null || Array.prototype,
    m = (_pushMaybeArray(log).call(log, 'k'), _flatMapMaybeArray(_ref)),
    {
      other
    } = _ref;
  return [typeof m, typeof other];
})();
export const r = [a2];