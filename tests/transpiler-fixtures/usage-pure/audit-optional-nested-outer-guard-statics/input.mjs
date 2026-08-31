// statics composing in one statement, one root per definedness: a store of a defined realm alias erases
// its guard and folds the assign into the collapsed receiver, while a store of the environment PROBE
// keeps its own - so the guarded static nests inside the erased one's argument, and stands beside it in
// an array. each static emits BARE into the body that owns it and the memos do not collide.
// distinct method per line
let w;
let v;
const g = globalThis;
export const nestedArg = (w = g)?.Array.of((v = globalThis.window)?.Array.from([1]).at(0)).at(0);
export const arrayOfTwo = [(w = g)?.Array.of(1).at(0), (v = globalThis.window)?.Array.from([2]).includes(2)];
