// Single-quasi template literal `globalThis[`Map`]` must be treated like a static string key.
// Without recognising it, the inner `globalThis` would be rewritten twice and the flatten would double-emit.
const { Map } = globalThis;
const inner = globalThis[`Map`];
const m = new Map();
m.set('a', inner);
export { m };
