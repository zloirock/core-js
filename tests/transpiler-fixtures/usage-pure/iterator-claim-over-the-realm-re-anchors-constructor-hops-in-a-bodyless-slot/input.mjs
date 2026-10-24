// The same realm pattern in a bodyless slot: the iterator claim keeps the host from its mirror, and every
// constructor hop beside it still re-anchors on the constructor's ponyfill - an assignment as a statement
// of its own in the block the slot becomes, a `var` as a declarator of its own - in the order the source
// wrote its hops, whether one hop stands beside the claim or two around it.
let it, customU, customM, it2, customP;
if (c) ({ Set: { customU }, [Symbol.iterator]: it, Map: { customM } } = globalThis);
if (d) ({ Promise: { customP }, [Symbol.iterator]: it2 } = globalThis);
if (e) var { WeakMap: { customW }, [Symbol.iterator]: it3, WeakSet: { customS } } = globalThis;
if (f) var { Iterator: { customI }, [Symbol.iterator]: it4 } = globalThis;
export const r = [it, customU, customM, it2, customP, it3, customW, customS, it4, customI];
