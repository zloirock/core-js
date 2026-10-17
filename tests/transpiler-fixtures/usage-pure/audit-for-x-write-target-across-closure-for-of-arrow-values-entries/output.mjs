import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
// A `for-x` head WRITES the member slot per iteration, so a body read of that slot is not a prototype lookup - the write-gate
// leaves it native.
const src = [1, 2];
// NEGATIVE: the head writes ANOTHER key, so the body read is an ordinary lookup
for (src.values of [() => 'assigned']) {
  const other = () => _entriesMaybeArray(src).call(src);
  export4(other);
}