import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
function viaNamespace() {
  {
    var WeakSet = _WeakMap;
  }
  return new WeakSet();
}
export const n = viaNamespace();