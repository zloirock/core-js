import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A static assigned to a local member target receives its pure method.
// Targets that would mutate a global stay native; residual members keep their constructor.
// Defaults over a defined pure static remain dead.
const box = {};
({
  Map: {
    groupBy: box.g
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
});
export const r = [box];