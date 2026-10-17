// A static assigned to a local member target receives its pure method.
// Targets that would mutate a global stay native; residual members keep their constructor.
// Defaults over a defined pure static remain dead.
const box = {};
// ... and a MULTI-hop pattern splits the same way, each hop answering on its own (a well-known-symbol
// leaf reads as the hop's own value)
let gb, it;
({ Map: { groupBy: gb }, Promise: { race: box.race } } = globalThis.window ?? globalThis);

export const r = [box, gb];
