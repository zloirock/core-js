import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// two consecutive removed props (`from`, `of`) where the higher-indexed is LAST, alongside a
// non-removed string-key sibling (`"z": z`) that bails synth-swap so body-extract still removes
// from/of. the per-prop removal ranges must not overlap on the shared comma (else the transform
// queue throws "partial overlap"). regression lock for that crash
// NOTE: this DECLARED function is non-exported and every local call leaves the default in
// place, so the resolver's call-site scan proves the lossy emission loses nothing and it
// stays enabled; exported / escaping / overridden functions stay verbatim instead
function f({ "z": z,  } = Array) {
  let from = _Array$from;
  let of = _Array$of; return [from, of, z]; }
f();