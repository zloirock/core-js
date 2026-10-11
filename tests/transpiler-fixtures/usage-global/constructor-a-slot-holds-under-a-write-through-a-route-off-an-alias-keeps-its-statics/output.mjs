import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
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
// a write through a selection or a member path starting off a plain alias of a container lands on the container
// all the same - an arm holding the alias, a chain of selections ending at it, a path off it - so the constructor
// the literal held there keeps its statics, read back off the container or off the alias; a write under another
// key through such an arm leaves the literal's constructor to the read
const grouped = {
  C: Map
};
const alias = grouped;
const spare = {};
const via = flag ? alias : spare;
via.C = userValue;
export const byKey = grouped.C.groupBy([1], x => x);
const settled = {
  C: Promise
};
const named = settled;
const either = opener || named;
either.C = userValue;
export const all = named.C.allSettled([]);
const iterated = {
  inner: {
    C: Iterator
  }
};
const same = iterated;
const member = same.inner;
member.C = userValue;
export const wrapped = iterated.inner.C.from([1]);
const parsed = {
  C: URL
};
const tail = parsed;
const link = flag ? first : tail;
const head = flag ? second : link;
head.C = userValue;
export const valid = parsed.C.canParse('a:b');
const registry = {
  C: Symbol
};
const known = registry;
const kept = {};
const elsewhere = flag ? known : kept;
elsewhere.D = userValue;
export const shared = registry.C.for('a');