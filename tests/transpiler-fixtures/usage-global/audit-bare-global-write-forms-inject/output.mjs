import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.aggregate-error.cause";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// usage-global equivalents of the bare slot-write forms: the WRITE itself is a usage - the
// polyfill must load so the slot exists (a strict-mode write to a missing global
// ReferenceErrors; RMW forms read it first). every form injects the written name's modules
// and the statement stays verbatim. one distinct global per form: flat, array-pattern
// element (plain and nested), object shorthand / renamed value, rest element, pattern
// default, for-of assignment-pattern head. flat compound / logical / update / for-x heads
// are locked by the neighboring fixtures. BINDING patterns (declaration, param, catch,
// for-x declaration) bind locals instead of writing globals - nothing injects for them
// beyond the destructuring protocol
Promise = shim;
[Map] = pair;
({
  Set
} = box);
({
  w: WeakMap
} = box);
[...WeakSet] = pool;
[Iterator = fallback] = pair;
[[AggregateError]] = deep;
for ([Symbol] of streams);
const [DisposableStack] = locals;
use(DisposableStack);
function boundParam([SuppressedError]) {
  return SuppressedError;
}
try {
  g();
} catch ({
  AsyncDisposableStack
}) {
  use(AsyncDisposableStack);
}
for (const [AsyncIterator] of streams) use(AsyncIterator);