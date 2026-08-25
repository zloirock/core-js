import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
// a `for-x` head WRITES the member slot per iteration, so a body read of that slot is not a
// prototype lookup - the write-gate leaves it native. the gate used to bail at any function
// boundary, which made the read inside a nested closure invisible to it: the polyfill then won
// over the value the head assigned. the boundary is crossed now, and the shape match beyond it
// has to prove the receiver is the SAME BINDING - name equality cannot tell a shadow apart
const src = [1, 2];
for (src.at of [() => 'assigned']) {
  const read = () => src.at(0);
  export1(read);
}

// NEGATIVE: a parameter binds the receiver name inside the closure, so the read is a different
// object and keeps its polyfill
for (src.flat of [() => 'assigned']) {
  const shadowed = src => _flatMaybeArray(src).call(src, 1);
  export2(shadowed);
}

// NEGATIVE: a declaration inside the closure shadows it just the same
for (src.keys of [() => 'assigned']) {
  const inner = () => {
    const src = [3];
    return _keysMaybeArray(src).call(src);
  };
  export3(inner);
}

// NEGATIVE: the head writes ANOTHER key, so the body read is an ordinary lookup
for (src.values of [() => 'assigned']) {
  const other = () => _entriesMaybeArray(src).call(src);
  export4(other);
}