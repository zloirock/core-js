import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Legacy self-guards (`var P = P || Legacy`, `var M = typeof M !== 'undefined' ? M : Legacy`) declare a
// name the file ALSO registers as a destructure alias of the global. Resolving the inner name re-enters the
// alias pre-pass through the adapter, which carries no cycle state, so the binding lookup breaks on its own
// in-flight guard - the recursion used to blow the stack and abort the build in both emitters and both
// methods. The inner name is the LOCAL var, so its member reads stay native; the outer alias keeps its
// polyfill. Two guard shapes, two receiver families, so neither site masks the other.
const P = _Promise;
export const settled = _Promise$allSettled([1]);
export function orGuard(Legacy) {
  var P = P || Legacy;
  return P.allSettled([2]);
}
const M = _Map;
export const grouped = _Map$groupBy([1], x => x);
export function typeofGuard(Legacy) {
  var M = typeof M !== 'undefined' ? M : Legacy;
  return M.groupBy([2], x => x);
}