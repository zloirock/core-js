import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// the ctor analog of the symbol nested-pattern shadow: a top-level `{ Map } = globalThis` folds a
// static access to the pure helper, but a NESTED-pattern binding of the same name reads
// `globalThis.constructor.Map` (=== undefined), NOT the global ctor - it must stay a raw read.
// the flat name-keyed alias registration would otherwise leak the outer hint into the inner shadow
const Map = _Map;
export const viaTopLevel = _Map$groupBy([1], x => x);
export function nestedShadow() {
  const {
    constructor: {
      Map
    }
  } = _globalThis;
  return Map.groupBy([2], x => x);
}

// an array-nested shadow (`{ a: [Set] }`) is likewise a different key path and stays native
export function arrayNestedShadow() {
  const {
    constructor: [Set]
  } = _globalThis;
  return Set.union(other);
}