import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// a class STATIC BLOCK owns a var scope but defers nothing: it runs exactly once, when the class
// definition evaluates. the placement walk terminated on it and applied the containment test written
// for FUNCTIONS - "the binding must live inside this terminator, else the statement may never run" -
// which refused every write whose alias is declared outside the class, and the legs then spelled the
// stored nav apart. the FIELD initializer next to it is the deferred sibling and keeps its own answer:
// it runs per instantiation, which may never happen
let out;
function eff() {}
let gb, vb;
class B {
  static {
    out = null == (gb = _globalThis, vb = null == gb[eff(), 'window'] ? void 0 : _self) ? void 0 : _Number$MAX_SAFE_INTEGER;
  }
}
let gc, vc;
class C {
  f = null == (gc = _globalThis, vc = null == gc[eff(), 'window'] ? void 0 : _self) ? void 0 : _Number$MAX_SAFE_INTEGER;
}
// the plain-statement twin both class bodies have to agree with
let ge, ve;
out = null == (ge = _globalThis, ve = null == ge[eff(), 'window'] ? void 0 : _self) ? void 0 : _Number$MAX_SAFE_INTEGER;
export const read = [out, B, C, vb, vc, ve];