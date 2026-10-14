import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.concat";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.queue-microtask";
import "core-js/modules/web.self";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
// A default on a realm key whose slot the realm always fills never runs: like the dead part of a decided
// selection it is no usage, whatever spells the realm - itself, an alias, `self`, an assignment's value - on a
// level as on a leaf. A parameter's realm default stands in for a caller's object, and an undecided selection's
// other arm is no realm: a default there may run and keeps its modules (`URLSearchParams`, `queueMicrotask`).
const {
  Map: {
    groupBy
  } = WeakSet
} = globalThis;
const realm = globalThis;
const {
  Promise: {
    allSettled
  } = WeakMap
} = realm;
const {
  Iterator: {
    concat
  } = DataView
} = self;
let entries;
({
  Object: {
    entries
  } = SuppressedError
} = globalThis);
const {
  JSON: J = DOMException
} = globalThis;
export function parameter({
  Reflect: {
    ownKeys
  } = URLSearchParams
} = globalThis) {
  return ownKeys;
}
const {
  Math: {
    sumPrecise
  } = queueMicrotask
} = flag ? globalThis : other;
export { groupBy, allSettled, concat, entries, J, sumPrecise };