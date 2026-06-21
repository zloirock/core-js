import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// two consecutive removed props (`from`, `of`) where the higher-indexed is LAST, alongside a
// retained string-key sibling (`"z": z`). the two per-prop removal ranges must not overlap on
// the shared comma (else "partial overlap" crash). this DECLARED non-exported fn with no
// escaping call site is safe to emit lossily; exported / escaping / overridden fns stay verbatim
function f({ "z": z,  } = Array) {
  let from = _Array$from;
  let of = _Array$of; return [from, of, z]; }
f();