// Alias writes in statement heads keep their placement and later reads.
// Effectful realm keys preserve the source stores and evaluation order.
let out;
function eff() {}
let gs, vs;
switch ((gs = globalThis, vs = gs.window?.self)?.Number.MAX_SAFE_INTEGER) { default: out = 1; }
let gi, vi;
if ((gi = globalThis, vi = gi.window?.self)?.Number.MAX_SAFE_INTEGER) out = 2;
let gw, vw;
while ((gw = globalThis, vw = gw.window?.self)?.Number.MAX_SAFE_INTEGER) break;
let gf, vf;
for (const it of [(gf = globalThis, vf = gf[(eff(), 'window')].self)?.Number.MAX_SAFE_INTEGER]) out = it;
let gn, vn;
for (const it in [(gn = globalThis, vn = gn[(eff(), 'window')].self)?.Number.MAX_SAFE_INTEGER]) out = it;
let ge, ve;
out = (ge = globalThis, ve = ge.window?.self)?.Number.MAX_SAFE_INTEGER;
export const read = [out, vs, vi, vw, vf, vn, ve];
