// A for-of head that ASSIGNS mirrors each claim into the iterated element. A computed key naming no
// known slot stops that mirror, so the static claim beside it keeps its own slot default - the one
// render the head has left, as on a head that declares. Both an object hop and a realm hop.
let from, of, other;
const key = pick();
for ({ w: { [key]: other, from } } of [{ w: Array }]) break;
for ({ Array: { of, [key]: other } } of [globalThis]) break;
export { from, of, other };
