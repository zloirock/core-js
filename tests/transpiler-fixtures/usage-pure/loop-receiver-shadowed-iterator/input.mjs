// An opaque or replaced loop value keeps its own receiver.
// Global pins syntax presence here; the separate at twin observes receiver inference.
for (const realm of [globalThis]) {
  const read = realm => {
    const { Array: { prototype: { [Symbol.iterator]: iterator } } } = realm;
    return iterator;
  };
  use(read(other));
}
