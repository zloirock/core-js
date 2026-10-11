import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$try from "@core-js/pure/actual/promise/try";
// several computed keys over a proven receiver no read takes owe it only what discarding it runs, ahead
// of the first key, once every key is served by name: a reused constructor keeps no coercion, and a
// captured call no binding
export const log = [];
const attempt = (_pushMaybeArray(log).call(log, 'i1'), _pushMaybeArray(log).call(log, 'k1'), _Promise$try),
  settle = (_pushMaybeArray(log).call(log, 'k2'), _Promise$allSettled);
export { attempt, settle };
function make() {
  _pushMaybeArray(log).call(log, 'i2');
  return Array;
}
const of = (make(), _pushMaybeArray(log).call(log, 'k3'), _Array$of),
  from = (_pushMaybeArray(log).call(log, 'k4'), _Array$from);
export { of, from };