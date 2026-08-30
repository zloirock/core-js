// a class STATIC BLOCK owns a var scope but defers nothing: it runs exactly once, when the class
// definition evaluates. the placement walk terminated on it and applied the containment test written
// for FUNCTIONS - "the binding must live inside this terminator, else the statement may never run" -
// which refused every write whose alias is declared outside the class, and the legs then spelled the
// stored nav apart. the FIELD initializer next to it is the deferred sibling and keeps its own answer:
// it runs per instantiation, which may never happen
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
