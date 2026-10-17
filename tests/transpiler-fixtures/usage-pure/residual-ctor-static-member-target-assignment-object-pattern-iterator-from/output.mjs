import _Iterator$from from "@core-js/pure/actual/iterator/from";
// A static assigned to a local member target receives its pure method.
// Targets that would mutate a global stay native; residual members keep their constructor.
// Defaults over a defined pure static remain dead.
const box = {};
({
  Iterator: {
    from: box.f
  }
} = {
  Iterator: {
    from: _Iterator$from
  }
});
export const r = [box];