import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise$race from "@core-js/pure/actual/promise/race";
// A static assigned to a local member target receives its pure method.
// Targets that would mutate a global stay native; residual members keep their constructor.
// Defaults over a defined pure static remain dead.
const box = {};
// ... and a SELECTING receiver standing as the host's own slot collapses before any of this, so the
// rows below read a plain proxy receiver and the member target extracts off it like any leaf
let all;
({
  Promise: {
    race: box.race,
    all
  }
} = {
  Promise: {
    race: _Promise$race,
    all: _Promise$all
  }
});
export const r = [box, all];