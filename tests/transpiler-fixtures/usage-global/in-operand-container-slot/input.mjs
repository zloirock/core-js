// an `in` probe whose object is a container slot - a class static stored in a literal, a literal
// slot, an array slot over a call or over a constructor, a const-folded key - names the
// constructor the slot holds: pure folds the probe, global injects the probed static
class K { static M = Map; }
const box = { M: K.M, P: Promise };
function iterator() { return Iterator; }
const symbols = { s: Symbol };
const k = 's';
const held = { A: Array };
export const grouped = 'groupBy' in box.M;
export const attempted = 'try' in box.P;
export const iterated = 'from' in [iterator()][0];
export const keyed = 'for' in symbols[k];
export const isError = 'isError' in [Error][0];
export const fromAsync = 'fromAsync' in held.A;
