import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// the SHADOW itself is reassigned locally - a mutation of the inner binding cannot reach the
// outer hop the alias actually captured
const outerRoot = _Promise;
const outerLink = outerRoot;
export function viaShadowReassignedLocally(outerRoot) {
  outerRoot = {};
  const allSettled = _Promise$allSettled;
  return allSettled([]);
}