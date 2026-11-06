// A plain realm run ending at backed self stores the always-defined ponyfill, directly or through an alias.
// A store of the terminal window probe preserves its value and keeps the optional continuation guarded.
let w, v, u;
const folded = globalThis.window.self;
export const overStore = (w = folded)?.Array.of(1);
// NEGATIVE: an alias of a TERMINAL probe read holds a value that can be absent and keeps its guard
const probe = globalThis.self.window;
export const overProbeStore = (v = probe)?.Array.of(2);
// The direct backed form reaches the same defined self value and preserves its store.
export const overDirectStore = (u = globalThis.window.self)?.Array.of(3);
