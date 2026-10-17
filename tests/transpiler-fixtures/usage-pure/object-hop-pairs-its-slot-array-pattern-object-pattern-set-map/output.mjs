import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
// ... and a wrapped STATIC beside its sibling declarator joins the same way, exported with its host
// - two of them, one per host; a mixed pair splits by declarator, the static joining its own host
export const [{
    Set: exportWrappedSet
  }, ee] = [{
    Set: _Set
  }, 2],
  [{
    Map: exportWrappedMap
  }, ef] = [{
    Map: _Map
  }, 3];
export default [exportWrappedSet, ee, exportWrappedMap, ef];