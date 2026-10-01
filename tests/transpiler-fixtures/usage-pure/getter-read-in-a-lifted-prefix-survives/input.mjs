// a sequence prefix element that READS through a getter (`K.g`) is work the source does, not a dead
// value: every channel that lifts or trims a destructure's prefix keeps it, in the order the source
// ran it - beside a sibling declarator, exported, in a loop head, ahead of a memo, in a bodyless slot,
// under an array wrapper, and behind a residual that keeps the realm
class K { static get g() { log(); return 0; } }
function mkMap() { log(); return Map; }
const z1 = 1, { from: a1, foo: b1 } = (K.g, Array);
export const z2 = 1, { of: a2, foo: b2 } = (K.g, Array);
for (const { fromEntries: a3, foo: b3 } = (K.g, Object); ;) break;
const { from: a4, name: nm4 } = (K.g, Iterator);
if (c) var { try: a5 } = (K.g, Promise);
if (c) var z6 = 1, { isError: a6 } = (K.g, Error);
const { groupBy: a7 } = (K.g, mkMap());
const [{ fromAsync: m8 }, z8] = [(K.g, Array), 1];
const { Set: S9, foo: b9 } = (K.g, globalThis);
use(z1, a1, b1, a3, b3, a4, nm4, a5, z6, a6, a7, m8, z8, S9, b9);
