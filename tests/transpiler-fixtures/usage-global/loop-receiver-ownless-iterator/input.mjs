// A loop binding supplies the receiver at this read.
// Global pins syntax presence here; the separate at twin observes receiver inference.
for (const realm of [globalThis]) {
  const { WeakSet: { [Symbol.iterator]: method } } = (before(), realm);
  use(method);
}
