// a LABEL names the statement it wraps without guarding it, so a write inside runs exactly when the
// unlabelled twin would. the placement walk accepted only a block and the export wrappers between the
// hosting statement and its terminator, so a label refused the write, the alias went untrusted, and
// the stored nav was spelled apart from every other position. the labeled BLOCK is the same question
// one layer down, and a switch CASE body is the negative: it is entered on one path
let out;
function eff() {}
let gl, vl;
lbl: out = (gl = globalThis, vl = gl[(eff(), 'window')].self)?.Number.MAX_SAFE_INTEGER;
let gb, vb;
blk: { out = (gb = globalThis, vb = gb[(eff(), 'window')].self)?.Number.MAX_SAFE_INTEGER; }
let gc, vc;
switch (out) {
  case 1: out = (gc = globalThis, vc = gc[(eff(), 'window')].self)?.Number.MAX_SAFE_INTEGER; break;
  default: break;
}
// the unlabelled twin all of the above are judged against
let ge, ve;
out = (ge = globalThis, ve = ge[(eff(), 'window')].self)?.Number.MAX_SAFE_INTEGER;
export const read = [out, vl, vb, vc, ve];
