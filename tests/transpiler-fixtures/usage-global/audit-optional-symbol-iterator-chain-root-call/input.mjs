// OPTIONAL `[Symbol.iterator]` on a proxy chain-root-CALL receiver `(call)?.self[Symbol.iterator]`. the
// receiver collapses to the always-defined proxy ROOT (`_globalThis`), so the `?.` on the proxy navigation
// is VESTIGIAL and must be SUBSUMED like babel - keeping the optional guard left a raw `globalThis` call +
// `_ref.self` (ie:11 ReferenceError + a babel/unplugin desync). a pure call drops entirely; an SE call is
// preserved in the collapse sequence `(call, _root)`; a deep `.self.window` hop collapses to the root too.
// fixture-only: the receiver resolves to globalThis (not iterable in Node) and the hazard is off-engine.
let n = 0;
const pureRoot = (() => globalThis)()?.self[Symbol.iterator];
const seCall = [...(() => { n += 1; return globalThis; })()?.self[Symbol.iterator]()];
const deepHop = (() => globalThis)()?.self.window[Symbol.iterator];
export { pureRoot, seCall, deepHop, n };
