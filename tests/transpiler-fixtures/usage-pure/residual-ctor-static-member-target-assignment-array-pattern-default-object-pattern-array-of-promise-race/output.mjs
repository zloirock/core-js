import _Array$of from "@core-js/pure/actual/array/of";
import _Promise$race from "@core-js/pure/actual/promise/race";
// A static assigned to a local member target receives its pure method.
// Targets that would mutate a global stay native; residual members keep their constructor.
// Defaults over a defined pure static remain dead.
const box = {};
let S, of, race, customZ;
[{
  Array: {
    of: box.of
  },
  Promise: {
    race
  }
} = {
  Array: {
    of: _Array$of
  },
  Promise: {
    race: _Promise$race
  }
}] = [];
export const r = [race, box];