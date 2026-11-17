import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// This method is not supplied by loop syntax, so the import set observes the receiver.
for (const realm of [_globalThis]) {
  const method = _atMaybeArray((before(), realm.Array.prototype));
  use(method);
}