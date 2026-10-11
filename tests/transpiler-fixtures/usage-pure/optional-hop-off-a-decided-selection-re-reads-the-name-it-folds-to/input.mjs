// a `?.` hop off a selection the build decides re-reads the name the selection folds to, so a static
// read off it takes the identity guard that name's own read takes: a reassigned alias, a loop head
class Shim {}
let A = Array;
if (globalThis.c) A = Shim;
export const named = (typeof Symbol != 'undefined' ? A : Object)?.fromAsync.name;
export const firsts = [];
for (const B of [Array]) firsts.push((B ?? Object)?.from([3]).includes(3));
