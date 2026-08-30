import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// the HEAD slot of a statement - a test, a switch discriminant, a for-of / for-in subject - evaluates
// whenever the statement runs, so an alias write standing there is as placed as one in an expression
// statement. the placement walk climbed EXPRESSIONS and recognised such a head only while the child
// still occupied that very slot: a render replaces what stands there, and the climb from the detached
// node then ran past the statement, past the program, and answered "conditional" from a walk that had
// lost its terminator. the alias went untrusted, and the two legs then spelled the stored nav apart.
// one alias per row: a name written twice is not a sole write, and the trust question never arises
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
for (const it of [null == (gf = _globalThis, vf = null == gf[eff(), 'window'] ? void 0 : _self) ? void 0 : _Number$MAX_SAFE_INTEGER]) out = it;
let gn, vn;
for (const it in [null == (gn = _globalThis, vn = null == gn[eff(), 'window'] ? void 0 : _self) ? void 0 : _Number$MAX_SAFE_INTEGER]) out = it;
// the expression-statement twin every head above has to agree with
let ge, ve;
out = null == (ge = _globalThis, ve = null == ge.window ? void 0 : _self) ? void 0 : _Number$MAX_SAFE_INTEGER;
export const read = [out, vs, vi, vw, vf, vn, ve];