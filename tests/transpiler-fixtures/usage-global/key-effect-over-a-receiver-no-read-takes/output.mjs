import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// a computed key consuming the whole declaration over a proven receiver no read takes owes that receiver
// only what discarding it runs: the init's effect leads the key on every declarator host - the export
// store, a declarator list, a call - and nothing binds the receiver or imports a constructor for it
// usage-global rewrites nothing: the Promise read loads its constructor modules, each claimed static its own
// (`from` with string iteration), `log.push` its own, and `Array` none of its own
export const log = [];
export const {
  [(log.push('k1'), 'try')]: attempt
} = (log.push('i1'), Promise);
let first = 1,
  {
    [(log.push('k2'), 'of')]: of
  } = (log.push('i2'), Array);
function make() {
  log.push('i3');
  return Array;
}
const {
  [(log.push('k3'), 'from')]: from
} = make();
export { first, of, from };