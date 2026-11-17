import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
// An opaque or replaced loop value keeps its own receiver.
for (let realm of [_globalThis]) {
  realm = other;
  const includes = _includes(realm.Array.prototype);
  use(includes);
}