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
switch ((gs = globalThis, vs = gs.window?.self)?.Number.MAX_SAFE_INTEGER) { default: out = 1; }
let gi, vi;
if ((gi = globalThis, vi = gi.window?.self)?.Number.MAX_SAFE_INTEGER) out = 2;
let gw, vw;
while ((gw = globalThis, vw = gw.window?.self)?.Number.MAX_SAFE_INTEGER) break;
let gf, vf;
for (const it of [(gf = globalThis, vf = gf[(eff(), 'window')].self)?.Number.MAX_SAFE_INTEGER]) out = it;
let gn, vn;
for (const it in [(gn = globalThis, vn = gn[(eff(), 'window')].self)?.Number.MAX_SAFE_INTEGER]) out = it;
// the expression-statement twin every head above has to agree with
let ge, ve;
out = (ge = globalThis, ve = ge.window?.self)?.Number.MAX_SAFE_INTEGER;
export const read = [out, vs, vi, vw, vf, vn, ve];
