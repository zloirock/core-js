import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An unknown key selects constructor slots for named static reads, without exposing the namespace.
// Returned, inline and nested containers contribute the same per-key candidates in global.
function box(v) {
  return [v];
}
const nested = {
  a: [Promise]
};
export const yielded = box(Map)[key].groupBy([1], x => x);
export const inPlace = [Object][key].groupBy([1], x => x);
export const hop = nested.a[key].withResolvers();