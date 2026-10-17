// A static assigned to a local member target receives its pure method.
// Targets that would mutate a global stay native; residual members keep their constructor.
// Defaults over a defined pure static remain dead.
const box = {};
let S, of, race, customZ;
({ Promise: { race: box.race, customZ } } = globalThis);

export const r = [customZ, box];
