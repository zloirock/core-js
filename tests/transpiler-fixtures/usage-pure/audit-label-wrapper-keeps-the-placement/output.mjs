import _globalThis from "@core-js/pure/actual/global-this";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _self from "@core-js/pure/actual/self";
// a LABEL names the statement it wraps without guarding it, so a write inside runs exactly when the
// unlabelled twin would. the placement walk accepted only a block and the export wrappers between the
// hosting statement and its terminator, so a label refused the write, the alias went untrusted, and
// the stored nav was spelled apart from every other position. the labeled BLOCK is the same question
// one layer down, and a switch CASE body is the negative: it is entered on one path
let out;
function eff() {}
let gl, vl;
lbl: out = (gl = _globalThis, vl = (eff(), _self), _Number$MAX_SAFE_INTEGER);
let gb, vb;
blk: {
  out = (gb = _globalThis, vb = (eff(), _self), _Number$MAX_SAFE_INTEGER);
}
let gc, vc;
switch (out) {
  case 1:
    out = (gc = _globalThis, vc = gc[eff(), 'window'].self)?.Number.MAX_SAFE_INTEGER;
    break;
  default:
    break;
}
// the unlabelled twin all of the above are judged against
let ge, ve;
out = (ge = _globalThis, ve = (eff(), _self), _Number$MAX_SAFE_INTEGER);
export const read = [out, vl, vb, vc, ve];