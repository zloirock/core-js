import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// param destructure-default with TWO consecutive removed body-extracted props at the HEAD
// (`from`, `of`) followed by a retained string-key sibling (`"z": z`, which bails synth-swap). the
// second removal must consult the preceding removal so the shared comma isn't double-consumed
// (partial-overlap crash). distinct from the tail-run case: here a retained prop follows the run
// (immediately invoked: caller-lossy param emissions stay sound only when every call site is
// visible - a declared function's params now stay verbatim instead)
(function f({
  "z": z
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, z];
})();