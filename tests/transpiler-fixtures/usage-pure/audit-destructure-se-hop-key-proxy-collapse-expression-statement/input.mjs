// Computed keys with effects keep their evaluation order through nested realm navigation.
// Proxy reads use the backed realm across statements, loop initializers, aliases and static leaves.
// A served logical left runs its key effects once and leaves its fallback inert.
let a = 0;
const { from } = globalThis[(a++, 'self')].Array;
from([1]);
