// an alias whose init navigates an unbacked hop to a BACKED leaf folds whole to that ponyfill, so
// the binding holds the realm object and a `?.` reading it through a store guards nothing. asked as
// "did the init spell an unbacked hop" the store kept a dead test on one leg only; the differential
// is blind to the whole class - the import sets are identical and only the text differs.
let w, v, u;
const folded = globalThis.window.self;
export const overStore = (w = folded)?.Array.of(1);
// NEGATIVE: an alias of a TERMINAL probe read holds a value that can be absent and keeps its guard
const probe = globalThis.self.window;
export const overProbeStore = (v = probe)?.Array.of(2);
// NEGATIVE: the same probe named directly, whose raw read the guard test re-emits
export const overDirectStore = (u = globalThis.window.self)?.Array.of(3);
