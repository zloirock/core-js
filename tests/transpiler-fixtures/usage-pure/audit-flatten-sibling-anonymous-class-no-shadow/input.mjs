// anonymous class as sibling: no id means no shadow. inner method ref to `globalThis`
// MUST be substituted to `_globalThis` - only named classes register their id in the
// scope walker locals, so anonymous siblings can't over-shadow the proxy global
const { Array: { from } } = globalThis, k = class { m() { return globalThis; } };
console.log(from, k);
