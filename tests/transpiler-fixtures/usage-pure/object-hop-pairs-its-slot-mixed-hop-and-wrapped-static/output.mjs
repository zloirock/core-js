import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
// An object hop and an array wrapper select constructors in one declaration,
// preserving the sibling bindings and their order.
function mixedHopAndWrappedStatic() {
  const {
      w: {
        Map: mixedMap
      },
      z: mz
    } = {
      w: {
        Map: _Map
      },
      z: 1
    },
    [{
      Set: mixedSet
    }, my] = [{
      Set: _Set
    }, 2];
  return [mixedMap, mz, mixedSet, my];
}
export default [mixedHopAndWrappedStatic()];