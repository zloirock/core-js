// A static assigned to a local member target receives its pure method.
// Targets that would mutate a global stay native; residual members keep their constructor.
// Defaults over a defined pure static remain dead.
const box = {};
({ Promise: { race: box.race = 1 } } = globalThis.window ?? globalThis);
export const r = [box];
