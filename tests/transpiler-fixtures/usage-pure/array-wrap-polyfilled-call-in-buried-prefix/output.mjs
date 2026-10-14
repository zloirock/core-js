import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A call the build polyfills inside the prefix an array wrapper's element buries keeps its own
// substitution while the static beside it is served by a literal in the slot: the prefix stays where
// the source wrote it, ahead of that literal, and runs once.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const w = "abc";
const [{
  Map: {
    groupBy
  }
}] = [(eff(_atMaybeString(w).call(w, -1)), {
  Map: {
    groupBy: _Map$groupBy
  }
})];
export { groupBy, seen };