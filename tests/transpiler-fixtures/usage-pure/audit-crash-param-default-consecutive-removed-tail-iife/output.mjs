import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// two consecutive removed props (`from`, `of`) where the higher-indexed is LAST, alongside a
// non-removed string-key sibling (`"z": z`) that bails synth-swap so body-extract still removes
// from/of. the per-prop removal ranges must not overlap on the shared comma (else the transform
// queue throws "partial overlap"). regression lock for that crash
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function f({
  "z": z
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, z];
})();