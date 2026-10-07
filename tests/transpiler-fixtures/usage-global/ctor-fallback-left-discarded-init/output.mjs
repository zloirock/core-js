import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.symbol.key-for";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// In usage-global the destructures stay as written and each live operand of an init injects its own
// family: the dead right of a deciding left injects nothing - every right names a family no other row
// reads, so its absence is this row's alone - while a right a maybe-falsy left keeps live is injected.
function make() {
  log();
  return Map;
}
let n = 0;
const {
  groupBy
} = make() || Set;
const {
  for: forKey
} = (n++, Symbol) || WeakSet;
let ownKeys;
({
  ownKeys
} = (n++, Reflect) ?? WeakMap);
const {
  withResolvers
} = (n++, Promise || Iterator);
let race, allSettled;
if (n >= 0) ({
  race
} = Promise ?? (n++, URL));
const tail = ({
  allSettled
} = Promise || (n++, DOMException), n);
let keyFor, reject;
({
  keyFor
} = (n++, Symbol || DisposableStack));
if (n >= 0) ({
  reject
} = (n++, Promise ?? (n++, AsyncDisposableStack)));
if (n >= 0) var {
  any
} = (n++, Promise || (n++, queueMicrotask));
for (var {
  try: attempt
} = (n++, Promise ?? (n++, Float32Array));;) break;
const maybe = pick();
const {
  from
} = maybe || Array;
export { groupBy, forKey, ownKeys, withResolvers, race, allSettled, tail, keyFor, reject, any, attempt, from, n };