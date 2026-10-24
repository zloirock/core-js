import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// two consecutive removed props (`from`, `of`) where the higher-indexed is LAST, alongside a
// retained string-key sibling (`"z": z`). the two per-prop removal ranges must not overlap on
// the shared comma (else "partial overlap" crash). IIFE form: a caller-lossy param emission is
// sound only when every call site is visible (a declared fn's params now stay verbatim instead)
// the pattern SYNTHS its default instead: a caller-correct literal beats the lossy removal, and it
// does so whatever the call sites look like. what this shape locks is therefore that the geometry no
// longer reaches the removal path - the ranges themselves are exercised where a dynamic computed key
// makes the literal impossible
(function f({
  "z": z,
  from,
  of
} = {
  "z": Array["z"],
  from: _Array$from,
  of: _Array$of
}) {
  return [from, of, z];
})();