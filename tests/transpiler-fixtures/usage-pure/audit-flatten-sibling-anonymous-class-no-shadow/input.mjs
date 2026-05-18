// anonymous class as sibling: no id means no shadow. inner method ref to `globalThis`
// MUST be substituted to `_globalThis` (regression-guard: ensures the Q10-4 fix did NOT
// over-shadow - only named classes register their id in the scope walker locals)
const { Array: { from } } = globalThis, k = class { m() { return globalThis; } };
console.log(from, k);
