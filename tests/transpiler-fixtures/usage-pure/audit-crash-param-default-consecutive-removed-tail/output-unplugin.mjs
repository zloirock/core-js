import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// two consecutive removed props (`from`, `of`) where the higher-indexed is LAST, alongside a
// non-removed computed-key sibling. the per-prop removal ranges must not overlap on the shared
// comma (else the transform queue throws "partial overlap"). regression lock for that crash
const k = "z";
function f({ [k]: z,  } = Array) {
  let from = _Array$from;
  let of = _Array$of; return [from, of, z]; }
f();