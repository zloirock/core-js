// definedness of a sequence value is decided by its TAIL: the prefix effect stays verbatim inside the
// assignment, the tail spells as the leaf ponyfill, and the guard is as dead as over the bare form
let e = 0;
let s;
export const viaSeqSelfValue = (s = (e++, globalThis.self))?.self.Array.prototype.at.call([1], 0);
export { e };
