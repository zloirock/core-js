import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _Promise$try from "@core-js/pure/actual/promise/try";
// a computed key consuming the whole declaration over a proven receiver no read takes owes that receiver
// only what discarding it runs: the init's effect leads the key on every declarator host - the export
// store, a declarator list, a call - and nothing binds the receiver or imports a constructor for it
export const log = [];
export const attempt = (_pushMaybeArray(log).call(log, 'i1'), _pushMaybeArray(log).call(log, 'k1'), _Promise$try);
let first = 1,
  of = (_pushMaybeArray(log).call(log, 'i2'), _pushMaybeArray(log).call(log, 'k2'), _Array$of);
function make() {
  _pushMaybeArray(log).call(log, 'i3');
  return Array;
}
const from = (make(), _pushMaybeArray(log).call(log, 'k3'), _Array$from);
export { first, of, from };