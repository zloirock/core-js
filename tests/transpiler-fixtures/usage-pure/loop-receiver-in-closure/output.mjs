import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// A loop binding supplies the receiver at this read.
for (const realm of [_globalThis, _globalThis]) {
  const read = () => {
    const includes = _includesMaybeArray(realm.Array.prototype);
    return includes;
  };
  use(read());
}