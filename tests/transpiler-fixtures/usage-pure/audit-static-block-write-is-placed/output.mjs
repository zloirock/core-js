import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// A static block evaluates with its class; an instance field evaluates on construction.
// In each body, a sole alias write is trusted by the following read in that evaluation.
// Plain window.self navigation lands on self while preserving computed-key effects and stores.
// A statement-level control exercises the same expression.
let out;
function eff() {}
let gb, vb;
class B {
  static {
    out = (gb = _globalThis, vb = (eff(), _self), _Number$MAX_SAFE_INTEGER);
  }
}
let gc, vc;
class C {
  f = (gc = _globalThis, vc = (eff(), _self), _Number$MAX_SAFE_INTEGER);
}
// the plain-statement twin both class bodies have to agree with
let ge, ve;
out = (ge = _globalThis, ve = (eff(), _self), _Number$MAX_SAFE_INTEGER);
export const read = [out, B, C, vb, vc, ve];