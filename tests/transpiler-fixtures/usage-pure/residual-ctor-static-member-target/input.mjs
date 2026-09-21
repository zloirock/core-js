// A static assigned to a local member target receives its pure method.
// Targets that would mutate a global stay native; residual members keep their constructor.
// Defaults over a defined pure static remain dead.
const box = {};
let S, of, race, customZ;

({ Promise: { race: box.race } } = globalThis);
({ Map: { groupBy: box.g } } = globalThis);
({ Iterator: { from: box.f } } = globalThis);
({ Symbol: { for: box.sf } } = globalThis);
({ Promise: { race: box.race, customZ } } = globalThis);
({ Promise: { customZ } } = globalThis);
({ Promise: { race } } = globalThis);
// ... and a COMPUTED key extracts where it FOLDS to the static's name (`[k]` with `const k = 'race'`,
// `['race']`, a template); a key carrying an EFFECT keeps the residual, which is where that effect
// still has to run, and the slot reads natively there
const k = 'race';
let n = 0;
({ Promise: { [k]: box.race } } = globalThis);
({ Promise: { ['race']: box.race } } = globalThis);
({ Promise: { [(n++, 'race')]: box.race } } = globalThis);
// ... and a PATTERN under the folded static key destructures the static's own ponyfill, as the
// literal key does (`_Promise$race.length`), on the declarator and the assignment host alike
const { Promise: { [k]: { length: viaDecl } } } = globalThis;
// ... and a SELECTING receiver standing as the host's own slot collapses before any of this, so the
// rows below read a plain proxy receiver and the member target extracts off it like any leaf
let all;
({ Promise: { race: box.race, all } } = globalThis.window ?? globalThis);
({ Promise: { race: box.race } } = globalThis.window ?? globalThis);
({ Promise: { race: box.race = 1 } } = globalThis.window ?? globalThis);
// ... and a MULTI-hop pattern splits the same way, each hop answering on its own (a well-known-symbol
// leaf reads as the hop's own value)
let gb, it;
({ Map: { groupBy: gb }, Promise: { race: box.race } } = globalThis.window ?? globalThis);
({ Map: { groupBy: gb }, Symbol: { [Symbol.iterator]: it } } = globalThis.window ?? globalThis);
let viaAssign;
({ Promise: { [k]: { length: viaAssign } } } = globalThis);

// ... and an ARRAY-WRAPPER default renders the whole level as a literal, which the member target
// rides like any slot: the ponyfill sits in the literal and the pattern writes it into the author's
// own object (`race: _Promise$race` beside `Set: _Set`)
[{ Set: S, Array: { of }, Promise: { race: box.race } } = globalThis] = [];
[{ Array: { of: box.of }, Promise: { race } } = globalThis] = [];
[{ Promise: { race }, Array: { of: box.of } } = globalThis] = [];

export const r = [S, of, race, customZ, box, viaDecl, viaAssign, all, gb, it];
