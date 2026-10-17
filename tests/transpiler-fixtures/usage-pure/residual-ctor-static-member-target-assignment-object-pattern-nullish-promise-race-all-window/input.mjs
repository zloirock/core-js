// A static assigned to a local member target receives its pure method.
// Targets that would mutate a global stay native; residual members keep their constructor.
// Defaults over a defined pure static remain dead.
const box = {};
// ... and a SELECTING receiver standing as the host's own slot collapses before any of this, so the
// rows below read a plain proxy receiver and the member target extracts off it like any leaf
let all;
({ Promise: { race: box.race, all } } = globalThis.window ?? globalThis);

export const r = [box, all];
