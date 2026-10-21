import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// Alias writes in statement heads keep their placement and later reads.
// Effectful realm keys preserve the source stores and evaluation order.
let out;
function eff() {}
let gs, vs;
switch (null == (gs = _globalThis, vs = null == gs.window ? void 0 : _self) ? void 0 : _Number$MAX_SAFE_INTEGER) {
  default:
    out = 1;
}
let gi, vi;
if (null == (gi = _globalThis, vi = null == gi.window ? void 0 : _self) ? void 0 : _Number$MAX_SAFE_INTEGER) out = 2;
let gw, vw;
while (null == (gw = _globalThis, vw = null == gw.window ? void 0 : _self) ? void 0 : _Number$MAX_SAFE_INTEGER) break;
let gf, vf;
for (const it of [(gf = _globalThis, vf = gf[eff(), 'window'].self)?.Number.MAX_SAFE_INTEGER]) out = it;
let gn, vn;
for (const it in [(gn = _globalThis, vn = gn[eff(), 'window'].self)?.Number.MAX_SAFE_INTEGER]) out = it;
let ge, ve;
out = null == (ge = _globalThis, ve = null == ge.window ? void 0 : _self) ? void 0 : _Number$MAX_SAFE_INTEGER;
export const read = [out, vs, vi, vw, vf, vn, ve];