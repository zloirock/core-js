import _Array$from from "@core-js/pure/actual/array/from";
// SE prefix that re-references the same Identifier as the tail: `(Array, Array)`.
// Tail is `Array` Identifier; prefix is also `Array` Identifier (no side effects, but
// trim shouldn't drop it because the synth-swap mutates only the tail. Verify both
// references receive consistent treatment after the swap)
function probe({
  from
} = (Array, {
  from: _Array$from
})) {
  return from([1]);
}
export { probe };