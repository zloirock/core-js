import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// param destructure-default with two removed body-extracted props (`from`, `of`) separated by a
// RETAINED string-key sibling (`"z": z`, which bails synth-swap). the retained prop breaks the run,
// so neither removal is preceded-by-removed: each takes its own clean trailing-comma range and the
// two never overlap (distinct from the contiguous-run cases, which share a comma). regression lock
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function f({
  "z": z
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, z];
})();