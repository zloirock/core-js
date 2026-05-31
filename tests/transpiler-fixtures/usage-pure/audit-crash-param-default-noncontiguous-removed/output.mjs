import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// param destructure-default with two removed body-extracted props (`from`, `of`) separated by a
// RETAINED computed-key sibling (`[k]: z`). the retained prop breaks the run, so neither removal
// is preceded-by-removed: each takes its own clean trailing-comma range and the two never overlap
// (distinct from the contiguous-run cases, which share a comma). regression lock
const k = "z";
function f({
  [k]: z
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, z];
}
f();