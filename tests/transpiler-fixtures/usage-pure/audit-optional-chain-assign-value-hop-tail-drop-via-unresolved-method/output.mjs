import _self from "@core-js/pure/actual/self";
// an UNRESOLVED method does not change the spelling: the chain still substitutes its ROOT, never the
// value leaf's own ponyfill - the call-rooted plan used to leak an assign-stored navigation through its
// object-name resolver, which peels assignments and reported the value's LEAF as the root
let u;
export const viaUnresolvedMethod = (u = _self, _self).Array.prototype.lastIndexOf.call([1], 1);