import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// regression lock: an IIFE-returned receiver (side-effecting) with a `...rest` sibling preserves the
// IIFE (its effect runs) and keeps the consumed key as a sentinel so rest stays exclusion-correct
let log = [];
const of = _Array$of;
const {
  of: _unused,
  ...rest
} = (() => {
  _pushMaybeArray(log).call(log, 1);
  return Array;
})();
of(2);
export { rest, log };