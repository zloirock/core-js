// well-known-symbol access over a KEPT chain-assign root (the stored value navigates an
// unresolvable hop, so the assignment stays the receiver): the harvested receiver SE - a
// sequence prefix around the root, a dropped-hop key effect - must ride ahead of the collapsed
// receiver on BOTH emitters (one used to drop it silently), and a live `?.` keeps its guard
// (the kept value can be absent - the helper would throw where native short-circuits)
let a;
export const keptPlain = (a = globalThis.window).self[Symbol.iterator];
let b;
let sc = 0;
export const sePrefix = (sc++, b = globalThis.window).self[Symbol.iterator];
let c;
export const seInValue = (c = (sc++, globalThis.window)).self[Symbol.iterator];
let d;
export const seHopKey = (d = globalThis.window)[(sc++, 'self')][Symbol.iterator];
let e;
export const optionalKept = (sc++, e = globalThis.window)?.self[Symbol.iterator];
let f;
export const symbolKeySe = (f = globalThis.window).self[Symbol[(sc++, 'iterator')]];
