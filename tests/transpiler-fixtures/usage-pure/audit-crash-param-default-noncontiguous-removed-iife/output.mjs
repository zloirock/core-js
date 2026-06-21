import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// param destructure-default with two removed props (`from`, `of`) separated by a RETAINED
// string-key sibling (`"z": z`). the retained prop breaks the run, so each removal takes its own
// clean trailing-comma range and the two never overlap (unlike the contiguous-run cases). IIFE
// form: caller-lossy emission is sound only with every call site visible (declared fn stays verbatim)
(function f({
  "z": z
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, z];
})();