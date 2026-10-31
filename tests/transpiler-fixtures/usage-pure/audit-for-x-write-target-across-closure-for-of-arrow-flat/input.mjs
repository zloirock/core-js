// A `for-x` head WRITES the member slot per iteration, so a body read of that slot is not a prototype lookup - the write-gate
// leaves it native.
const src = [1, 2];
// NEGATIVE: a parameter binds the receiver name inside the closure, so the read is a different
// object and keeps its polyfill
for (src.flat of [() => 'assigned']) {
  const shadowed = src => src.flat(1);
  export2(shadowed);
}
