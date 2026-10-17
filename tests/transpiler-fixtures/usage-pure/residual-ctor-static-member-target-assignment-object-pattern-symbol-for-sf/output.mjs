import _Symbol$for from "@core-js/pure/actual/symbol/for";
// A static assigned to a local member target receives its pure method.
// Targets that would mutate a global stay native; residual members keep their constructor.
// Defaults over a defined pure static remain dead.
const box = {};
({
  Symbol: {
    for: box.sf
  }
} = {
  Symbol: {
    for: _Symbol$for
  }
});
export const r = [box];