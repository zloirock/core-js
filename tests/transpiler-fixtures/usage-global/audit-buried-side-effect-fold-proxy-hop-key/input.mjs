// usage-global parity for a side effect buried in a fold of a proxy-global HOP key (`globalThis[(eff(), 'se')
// + 'lf']` is the `.self` hop). usage-global resolves the polyfilled static THROUGH the fold (injects the
// import) and keeps the member verbatim - the buried `eff()` is never folded away. mirrors the original shape
// set: bare-root `+`-concat, alias-root template, direct top-level SE (no fold), and a no-SE concat control;
// distinct polyfilled static per line so no two lines share a chain.
let log = [];
function eff(tag) { log.push(tag); return 'se'; }
const g = globalThis;
const bareConcat = globalThis[(eff('a'), 'se') + 'lf'].Array.from([1]);
const aliasTemplate = g[`s${ (eff('b'), 'e') }lf`].Object.fromEntries([['x', 1]]);
const directSe = globalThis[(eff('c'), 'self')].Array.of(2);
const noSe = globalThis['se' + 'lf'].Object.entries({ y: 1 });
export { bareConcat, aliasTemplate, directSe, noSe, log };
