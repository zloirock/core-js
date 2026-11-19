import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// This method is not supplied by loop syntax, so the import set observes the receiver.
for (const realm of [_globalThis]) {
  const read = realm => {
    const method = _at(realm.Array.prototype);
    return method;
  };
  use(read(other));
}