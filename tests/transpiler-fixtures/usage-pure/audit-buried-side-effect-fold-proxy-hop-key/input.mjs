// A side effect buried in a fold of a proxy-global HOP key (`globalThis[(eff(), 'se') + 'lf']` is the `.self`
// hop). usage-pure collapses the redundant hop to the proxy ROOT pure import and HARVESTS the buried `eff()`
// as a sequence prefix: `(eff(), _globalThis).Array.isArray`. it must never leave a dead `_globalThis.self`
// hop (undefined off-engine) nor drop eff(). collapse + harvest is uniform across BOTH the proxy-hop-collapse
// path (non-pure leaf `Array.isArray` / `Math.max`) and the static-dispatch path (pure leaf `Array.from`), and
// across roots (a bare global and a `const`-aliased global both re-root to `_globalThis`). mirrors the shape
// set: bare-root `+`-concat, alias-root template, direct top-level SE (no fold), no-SE concat control.
let log = [];
function eff(tag) { log.push(tag); return 'se'; }
const g = globalThis;
const bareConcat = globalThis[(eff('a'), 'se') + 'lf'].Array.isArray([1]);
const aliasTemplate = g[`s${ (eff('b'), 'e') }lf`].Math.max(1, 2);
const directSe = globalThis[(eff('c'), 'self')].Array.from([3]);
const noSe = globalThis['se' + 'lf'].Array.of(4);
export { bareConcat, aliasTemplate, directSe, noSe, log };
