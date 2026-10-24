import _Array$of from "@core-js/pure/actual/array/of";
import _Promise$race from "@core-js/pure/actual/promise/race";
import _Set from "@core-js/pure/actual/set";
// A static assigned to a local member target receives its pure method.
// Targets that would mutate a global stay native; residual members keep their constructor.
// Defaults over a defined pure static remain dead.
const box = {};
let S, of, race, customZ;
// ... and an ARRAY-WRAPPER default renders the whole level as a literal, which the member target
// rides like any slot: the ponyfill sits in the literal and the pattern writes it into the author's
// own object (`race: _Promise$race` beside `Set: _Set`)
[{
  Set: S,
  Array: {
    of
  },
  Promise: {
    race: box.race
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  },
  Promise: {
    race: _Promise$race
  }
}] = [];
export const r = [S, of, box];