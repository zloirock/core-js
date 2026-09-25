import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
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
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.can-parse";
import "core-js/modules/web.url.to-json";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
// a slot default fires only where the slot is undefined, and a key the FILE writes onto a prototype
// is one every literal of that chain inherits - an array hole included: none of the first three
// bindings is certainly its default, so pure guards each static read on the default's constructor and
// usage-global injects for it. a key nothing writes there, and a slot past an array's end, which the
// iterator never reads, stay certain, and pure reads the default's static outright
Object.prototype.lent = Set;
const {
  lent: L = Array
} = {};
export const viaWrite = L.of(1);
Object.defineProperty(Object.prototype, 'given', {
  value: Set
});
const {
  given: G = Object
} = {};
export const viaDefine = G.fromEntries([]);
Array.prototype[0] = Set;
const [H = Map] = [,];
export const viaHole = H.groupBy([], x => x);
const {
  other: O = Promise
} = {};
export const viaUnwritten = O.allSettled([]);
const [P = URL] = [];
export const viaPastTheEnd = P.canParse('a:b');