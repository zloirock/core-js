import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// param destructure-default with TWO consecutive removed body-extracted props at the HEAD
// (`from`, `of`) followed by a retained computed-key sibling. the second removal must consult the
// preceding removal so the shared comma isn't double-consumed (partial-overlap crash). distinct
// from the tail-run case: here a retained prop follows the run. regression lock
const k = "z";
function f({
  [k]: z
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, z];
}
f();