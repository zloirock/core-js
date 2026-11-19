import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// A loop binding supplies the receiver at this read.
// Global pins syntax presence here; the separate at twin observes receiver inference.
for (const realm of [_globalThis]) {
  const iterator = _getIteratorMethod((before(), realm.Array.prototype));
  use(iterator);
}