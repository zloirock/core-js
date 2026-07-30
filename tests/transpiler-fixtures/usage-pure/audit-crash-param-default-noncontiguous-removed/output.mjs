import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// param destructure-default with two removed props (`from`, `of`) separated by a RETAINED
// string-key sibling (`"z": z`). the retained prop breaks the run, so each removal takes its own
// clean trailing-comma range and the two never overlap (unlike the contiguous-run cases that
// share a comma). this DECLARED non-exported fn is safe to emit lossily; others stay verbatim
// the pattern SYNTHS its default instead: a caller-correct literal beats the lossy removal, and it
// does so whatever the call sites look like. what this shape locks is therefore that the geometry no
// longer reaches the removal path - the ranges themselves are exercised where a dynamic computed key
// makes the literal impossible
function f({
  from,
  "z": z,
  of
} = {
  from: _Array$from,
  "z": Array["z"],
  of: _Array$of
}) {
  return [from, of, z];
}
f();