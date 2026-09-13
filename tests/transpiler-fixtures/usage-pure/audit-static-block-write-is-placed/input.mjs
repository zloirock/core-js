// A static block evaluates with its class; an instance field evaluates on construction.
// In each body, a sole alias write is trusted by the following read in that evaluation.
// Plain window.self navigation lands on self while preserving computed-key effects and stores.
// A statement-level control exercises the same expression.
let out;
function eff() {}
let gb, vb;
class B { static { out = (gb = globalThis, vb = gb[(eff(), 'window')].self)?.Number.MAX_SAFE_INTEGER; } }
let gc, vc;
class C { f = (gc = globalThis, vc = gc[(eff(), 'window')].self)?.Number.MAX_SAFE_INTEGER; }
// the plain-statement twin both class bodies have to agree with
let ge, ve;
out = (ge = globalThis, ve = ge[(eff(), 'window')].self)?.Number.MAX_SAFE_INTEGER;
export const read = [out, B, C, vb, vc, ve];
