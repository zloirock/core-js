// A Symbol.iterator alias selects an iterator method on a sequence receiver.
// The alias key adds no effect; the receiver prefix runs exactly once before the method read.
const S = Symbol.iterator;
let recv = [1, 2, 3];
const it = (a(), recv)[S]();
