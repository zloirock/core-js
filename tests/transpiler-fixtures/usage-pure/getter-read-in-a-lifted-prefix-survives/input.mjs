// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
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
