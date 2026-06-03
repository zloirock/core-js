// the IIFE-callee alias `f` is UNCONDITIONALLY reassigned before the use, so the reassignment
// DOMINATES it - at the call f returns Object, not Array, and f().from is not Array.from. usage-global
// must NOT inject es.array.from (the init `() => Array` is dead). shows the sibling resolver honors
// dominance, not only the conditional/after-use cases that resolve.
let f = () => Array;
f = () => Object;
f().from([1, 2, 3]);
