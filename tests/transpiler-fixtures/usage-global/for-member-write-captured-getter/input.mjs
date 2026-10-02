// A captured object keeps its declaration scope despite a same-named local at the read.
// The head writes to the first returned array; the body reads a fresh array from the getter.
function read() {
  const inner = { value: [] };
  for (box.inner.value.at of [0]) return [box.inner.value.at(-1), inner.value.length];
}
const inner = { get value() { return [3, 4]; } };
const box = { inner };
consume(read());
