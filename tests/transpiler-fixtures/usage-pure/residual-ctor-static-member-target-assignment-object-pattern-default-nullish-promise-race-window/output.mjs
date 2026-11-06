import _Promise$race from "@core-js/pure/actual/promise/race";
// A static assigned to a local member target receives its pure method.
// Targets that would mutate a global stay native; residual members keep their constructor.
// Defaults over a defined pure static remain dead.
const box = {};
({
  Promise: {
    race: box.race = 1
  }
} = {
  Promise: {
    race: _Promise$race
  }
});
export const r = [box];