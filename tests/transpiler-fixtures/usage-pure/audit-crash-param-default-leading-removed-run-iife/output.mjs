import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// param destructure-default with TWO consecutive removed props at the HEAD (`from`, `of`)
// followed by a retained string-key sibling (`"z": z`). the second removal must consult the
// first so the shared comma isn't double-consumed (partial-overlap crash). IIFE form: a
// caller-lossy param emission is sound only with every call site visible (declared fn stays verbatim)
// the pattern SYNTHS its default instead: a caller-correct literal beats the lossy removal, and it
// does so whatever the call sites look like. what this shape locks is therefore that the geometry no
// longer reaches the removal path - the ranges themselves are exercised where a dynamic computed key
// makes the literal impossible
(function f({
  from,
  of,
  "z": z
} = {
  from: _Array$from,
  of: _Array$of,
  "z": Array["z"]
}) {
  return [from, of, z];
})();