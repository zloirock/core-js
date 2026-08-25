// a KEPT chain-assign root whose erased proxy hop carried the guard, read through a nav that
// SURVIVES the collapse: the guard re-hangs on the leaf the collapse leaves, and the hops above
// it stay inside the same chain - sealing them would throw where the source answers undefined.
// the sealed twin below spells the seal itself and keeps the throw
var q;
var w;
export const nav = ((q = globalThis.window)?.self.box.arr).at(0);
export const sealed = (((w = globalThis.window)?.self).box.arr).at(0);
export const seen = [q, w];
