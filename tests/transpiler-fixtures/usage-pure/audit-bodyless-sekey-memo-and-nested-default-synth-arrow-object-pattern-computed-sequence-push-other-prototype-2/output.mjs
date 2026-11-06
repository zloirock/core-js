import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Bodyless computed-key destructures evaluate the receiver once and extract properties in order.
// Instance parameter defaults retain their receiver-read limits. Nested defaults belong to their
// own receiver slot in declarations, assignments and catch parameters.
const log = [];
const cond = true;
// ... and an EFFECTFUL init rides the same memo - one evaluation, where the source ran it
export const a4 = (() => {
  if (cond) var _ref = (() => {
      _pushMaybeArray(log).call(log, 'call');
      return Array.prototype;
    })(),
    m = null == _ref ? _ref[""] : (_pushMaybeArray(log).call(log, 'k'), _flatMaybeArray(_ref)),
    {
      other
    } = _ref;
  return [typeof m, typeof other];
})();
export const r = [a4];