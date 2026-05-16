import _Array$from from "@core-js/pure/actual/array/from";
// POSITIVE/SANITY: a genuine IIFE invoking THIS function passes the callee-identity
// guard and resolves `{from}` to its IIFE arg as expected. regression guard ensuring
// the fix doesn't over-bail on real IIFE patterns - paired with `audit-fn-as-arg-*`
// negatives that exercise the same code path with a non-IIFE function.
const x = function ({
  from
}) {
  return from([1, 2, 3]);
}({
  from: _Array$from
});