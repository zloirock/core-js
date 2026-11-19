// the SHADOW itself is reassigned locally - a mutation of the inner binding cannot reach the
// outer hop the alias actually captured
const outerRoot = Promise;
const outerLink = outerRoot;
export function viaShadowReassignedLocally(outerRoot) {
  outerRoot = {};
  const { allSettled } = outerLink;
  return allSettled([]);
}
