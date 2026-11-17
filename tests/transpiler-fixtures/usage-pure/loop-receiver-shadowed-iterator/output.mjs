import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// An opaque or replaced loop value keeps its own receiver.
// Global pins syntax presence here; the separate at twin observes receiver inference.
for (const realm of [_globalThis]) {
  const read = realm => {
    const iterator = _getIteratorMethod(realm.Array.prototype);
    return iterator;
  };
  use(read(other));
}