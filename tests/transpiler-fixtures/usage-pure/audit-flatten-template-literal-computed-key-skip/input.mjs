// Single-quasi template literal `globalThis[`Map`]` must be treated like a static string key.
// Without recognising it, the inner `globalThis` would be rewritten twice and the flatten would double-emit.
// The two Map imports are two claims, not a double-emit: the `new` callee keeps the bare constructor
// entry while the read handed to `m.set` escapes and has to carry the constructor's statics.
const { Map } = globalThis;
const inner = globalThis[`Map`];
const m = new Map();
m.set('a', inner);
export { m };
