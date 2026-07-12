// the ctor analog of the symbol nested-pattern shadow: a top-level `{ Map } = globalThis` folds a
// static access to the pure helper, but a NESTED-pattern binding of the same name reads
// `globalThis.constructor.Map` (=== undefined), NOT the global ctor - it must stay a raw read.
// the flat name-keyed alias registration would otherwise leak the outer hint into the inner shadow
const { Map } = globalThis;
export const viaTopLevel = Map.groupBy([1], x => x);

export function nestedShadow() {
  const { constructor: { Map } } = globalThis;
  return Map.groupBy([2], x => x);
}

// an array-nested shadow (`{ a: [Set] }`) is likewise a different key path and stays native
export function arrayNestedShadow() {
  const { constructor: [Set] } = globalThis;
  return Set.union(other);
}
