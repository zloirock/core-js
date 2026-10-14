// An assignment pattern over the realm whose iterator claim keeps the host from its mirror: a constructor hop
// beside it re-anchors on the constructor's ponyfill in a statement of its own, every piece in the order the
// source wrote its hop - one hop written first, and two around the claim.
let it, it2, customU, customP, customM;
({ Set: { customU }, [Symbol.iterator]: it } = globalThis);
({ Promise: { customP }, [Symbol.iterator]: it2, Map: { customM } } = globalThis);
export const r = [it, it2, customU, customP, customM];
