// an UNRESOLVED method does not change the spelling: the chain still substitutes its ROOT, never the
// value leaf's own ponyfill - the call-rooted plan used to leak an assign-stored navigation through its
// object-name resolver, which peels assignments and reported the value's LEAF as the root
let u;
export const viaUnresolvedMethod = (u = globalThis.self)?.self.Array.prototype.lastIndexOf.call([1], 1);
