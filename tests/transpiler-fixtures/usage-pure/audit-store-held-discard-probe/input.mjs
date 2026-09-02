// a destructure that CONSUMES its init discards the read the source performed on an inline kept
// STORE, and off-realm that read is what throws: the probe channel re-emits it, respelled from the
// seal the source wrote and carrying the store itself, so the write still runs exactly once. the
// holder's spelling is not the question - a named binding and an inline store hold a value alike
let w1, w2, w3, w4;
const { Map: M } = (w1 = globalThis.window).self;
const { of: ofOverHop } = (w2 = globalThis.window).self.Array;
const { of: ofDirect } = (w3 = globalThis.window).Array;
let assigned;
({ of: assigned } = (w4 = globalThis.window).self.Array);
// a store the realm ALWAYS fills has nothing to throw: the read over it is the vacuous one and
// only the write survives
let g;
const { from } = (g = globalThis).self.Array;
export { M, ofOverHop, ofDirect, assigned, from, w1, w2, w3, w4, g };
