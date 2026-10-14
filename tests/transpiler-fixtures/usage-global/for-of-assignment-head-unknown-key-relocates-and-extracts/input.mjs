// A for-of head that ASSIGNS mirrors each claim into the iterated element. A computed key naming no
// known slot stops that mirror, so the head relocates into the body, where the static claim beside the
// key extracts and the residual keeps the key - an object hop and a realm hop alike; unplugin reads that
// residual through the collapsed hop (sidecar).
let from, trunc, other;
const key = pick();
for ({ w: { [key]: other, from } } of [{ w: Array }]) break;
for ({ Math: { trunc, [key]: other } } of [globalThis]) break;
export { from, trunc, other };
