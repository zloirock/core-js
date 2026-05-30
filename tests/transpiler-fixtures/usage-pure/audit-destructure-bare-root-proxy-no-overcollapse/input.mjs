// CONTROL: a bare-root proxy receiver (`globalThis.Array`, no intermediate hop) stays on its
// natural global-rewrite path - the root is substituted to `_globalThis.Array` and the receiver
// is NOT over-collapsed (there is no `self` hop to drop). locks that collapse touches real hops
const { of, other } = globalThis.Array;
of(1, 2);
console.log(other);
