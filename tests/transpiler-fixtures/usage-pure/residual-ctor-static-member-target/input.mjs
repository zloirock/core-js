// A residual leaf naming one of the anchored ctor's OWN statics with no extraction to serve it - a
// member target, which the raw canon keeps - reads the native receiver: the pure ctor binding is
// the `*/constructor` entry, which carries none of the statics (`_Promise.race` is `undefined`).
// The sole-hop residual keeps the native receiver instead of re-anchoring on `_Promise` / `_Map` /
// `_Iterator` / `_Symbol`, and a mirrored literal spells the leaf as a raw read through the proxy
// (`_globalThis.Promise.race`), never the ponyfill - which would land in the user's object. A
// non-polyfillable key still re-anchors, and a binding leaf still extracts (the controls).
const box = {};
let S, of, race, customZ;

({ Promise: { race: box.race } } = globalThis);
({ Map: { groupBy: box.g } } = globalThis);
({ Iterator: { from: box.f } } = globalThis);
({ Symbol: { for: box.sf } } = globalThis);
({ Promise: { race: box.race, customZ } } = globalThis);
({ Promise: { customZ } } = globalThis);
({ Promise: { race } } = globalThis);
// ... and a COMPUTED key names the static as the literal does where it folds (`[k]` with
// `const k = 'race'`, `['race']`); a key nothing folds (an effect) may name any static at runtime,
// so that anchor declines too - the raw residual reads what the source read
const k = 'race';
let n = 0;
({ Promise: { [k]: box.race } } = globalThis);
({ Promise: { ['race']: box.race } } = globalThis);
({ Promise: { [(n++, 'race')]: box.race } } = globalThis);
// ... and a PATTERN under the folded static key destructures the static's own ponyfill, as the
// literal key does (`_Promise$race.length`), on the declarator and the assignment host alike
const { Promise: { [k]: { length: viaDecl } } } = globalThis;
// ... and under a SELECTING receiver the fallback arm's mirror keeps the member target as a RAW
// slot beside the ponyfilled sibling (`race: _globalThis.Promise.race, all: _Promise$all`), does
// not fire where every leaf is one, and a defaulted member target keeps the user's default
let all;
({ Promise: { race: box.race, all } } = globalThis.window ?? globalThis);
({ Promise: { race: box.race } } = globalThis.window ?? globalThis);
({ Promise: { race: box.race = 1 } } = globalThis.window ?? globalThis);
// ... and a MULTI-hop pattern under the selecting receiver renders one literal: a hop with nothing
// to polyfill joins it as a passthrough beside the sibling hop's ponyfill (a member target raw,
// a well-known-symbol leaf as the hop's own value)
let gb, it;
({ Map: { groupBy: gb }, Promise: { race: box.race } } = globalThis.window ?? globalThis);
({ Map: { groupBy: gb }, Symbol: { [Symbol.iterator]: it } } = globalThis.window ?? globalThis);
let viaAssign;
({ Promise: { [k]: { length: viaAssign } } } = globalThis);

[{ Set: S, Array: { of }, Promise: { race: box.race } } = globalThis] = [];
[{ Array: { of: box.of }, Promise: { race } } = globalThis] = [];
[{ Promise: { race }, Array: { of: box.of } } = globalThis] = [];

export const r = [S, of, race, customZ, box, viaDecl, viaAssign, all, gb, it];
