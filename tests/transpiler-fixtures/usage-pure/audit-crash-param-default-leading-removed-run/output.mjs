import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// param destructure-default with TWO consecutive removed props at the HEAD (`from`, `of`)
// followed by a retained string-key sibling (`"z": z`). the second removal must consult the
// first so the shared comma isn't double-consumed (partial-overlap crash). this DECLARED
// non-exported fn with no escaping call site is safe to emit lossily; others stay verbatim
function f({
  "z": z
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, z];
}
f();