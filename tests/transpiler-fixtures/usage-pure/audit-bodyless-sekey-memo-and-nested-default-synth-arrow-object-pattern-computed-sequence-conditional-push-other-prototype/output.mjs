import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Bodyless computed-key destructures evaluate the receiver once and extract properties in order.
// Instance parameter defaults retain their receiver-read limits. Nested defaults belong to their
// own receiver slot in declarations, assignments and catch parameters.
const log = [];
const cond = true;
// A bodyless slot evaluates its receiver once, checks object coercibility unless the receiver is never
// nullish (a literal, a built-in prototype), converts the computed key, extracts the method, then reads
// residual siblings in source order.
export const a1 = (() => {
  if (cond) var _ref = Array.prototype,
    m = (_pushMaybeArray(log).call(log, 'k'), _findLastMaybeArray(_ref)),
    {
      other
    } = _ref;
  return [typeof m, typeof other];
})();
export const r = [a1];