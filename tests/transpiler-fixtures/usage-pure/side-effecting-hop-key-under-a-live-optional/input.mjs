// a proxy-global HOP KEY carrying a side effect, read under a LIVE `?.`: the guard test is the kept
// source of the hop that owns the key, so it already evaluates that effect - re-emitting it ahead of
// the alternate would run it twice where native runs it once. a key ABOVE the guarded hop is the
// boundary: the test never reaches it, so that one DOES belong to the alternate
let log = [];
function eff(t) { log.push(t); return t; }
const plainRoot = globalThis[(eff('a'), 'window')]?.self.Array;
const g = globalThis;
const aliasRoot = g[(eff('b'), 'window')]?.self.Map;
const aboveTheGuard = globalThis.window?.[(eff('c'), 'self')].Set;
const bothSides = globalThis[(eff('d'), 'window')]?.[(eff('e'), 'self')].Promise;
export { log, plainRoot, aliasRoot, aboveTheGuard, bothSides };
