import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.with";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
// A default on a slot the realm always fills never runs - a realm key's, on a leaf as on a level, and a
// static's read through such a key - so a write in it reaches no later read, which loads none of the
// array modules the dead write would bring. A parameter's realm default stands in for a caller's object,
// which may lack the slot: the default there runs, and its write reaches the read.
let a = 'ab',
  b = 'cd',
  c = 'ef',
  d = 'gh';
const {
  Map: M = (a = [1], Set)
} = globalThis;
const {
  Promise: {
    allSettled
  } = (b = [2], WeakMap)
} = globalThis;
const {
  Array: {
    from = (c = [3], 0)
  }
} = globalThis;
export function parameter({
  Reflect: {
    ownKeys
  } = (d = [4], URLSearchParams)
} = globalThis) {
  return ownKeys;
}
parameter({});
export const reads = [a.flat(), b.findLast(Boolean), c.toReversed(), d.with(0, 1)];
export { M, allSettled, from };