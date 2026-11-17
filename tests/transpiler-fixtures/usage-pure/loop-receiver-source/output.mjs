import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// A loop binding supplies the receiver at this read.
for (const realm of [_globalThis]) {
  const at = _atMaybeArray(realm.Array.prototype);
  use(at);
}