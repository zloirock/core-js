import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Bodyless computed-key destructures evaluate the receiver once and extract properties in order.
// Instance parameter defaults retain their receiver-read limits. Nested defaults belong to their
// own receiver slot in declarations, assignments and catch parameters.
const log = [];
export const a3 = (() => {
  let i = 0;
  do var _ref = (_pushMaybeArray(log).call(log, 't'), Array.prototype),
    m = (_pushMaybeArray(log).call(log, 'k'), _atMaybeArray(_ref)),
    {
      other
    } = _ref; while (i++ < 0);
  return [typeof m, typeof other];
})();
export const r = [a3];