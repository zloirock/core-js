import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// An opaque or replaced loop value keeps its own receiver.
for (const realm of [_globalThis, other]) {
  const at = _at(realm.Array.prototype);
  use(at);
}