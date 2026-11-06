import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
// A `for-x` head WRITES the member slot per iteration, so a body read of that slot is not a prototype lookup - the write-gate
// leaves it native.
const src = [1, 2];
// NEGATIVE: a declaration inside the closure shadows it just the same
for (src.keys of [() => 'assigned']) {
  const inner = () => {
    const src = [3];
    return _keysMaybeArray(src).call(src);
  };
  export3(inner);
}