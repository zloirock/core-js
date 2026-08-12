import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Legacy self-guards (`var P = P || Legacy`, `var M = typeof M !== 'undefined' ? M : Legacy`) declare a
// name the file ALSO registers as a destructure alias of the global. Resolving the inner name re-enters the
// alias pre-pass through the adapter, which carries no cycle state, so the binding lookup breaks on its own
// in-flight guard - the recursion used to blow the stack and abort the build in both emitters and both
// methods. The inner name is the LOCAL var, so its member reads stay native; the outer alias keeps its
// polyfill. Two guard shapes, two receiver families, so neither site masks the other.
const {
  Promise: P
} = globalThis;
export const settled = P.allSettled([1]);
export function orGuard(Legacy) {
  var P = P || Legacy;
  return P.allSettled([2]);
}
const {
  Map: M
} = globalThis;
export const grouped = M.groupBy([1], x => x);
export function typeofGuard(Legacy) {
  var M = typeof M !== 'undefined' ? M : Legacy;
  return M.groupBy([2], x => x);
}