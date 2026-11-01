import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// Mixed values, a changed loop binding and a shadowed name keep their own receivers.
for (const realm of [_globalThis, other]) {
  const at = _at(realm.Array.prototype);
  use(at);
}
for (let realm of [_globalThis]) {
  realm = other;
  const includes = _includes(realm.Array.prototype);
  use(includes);
}
for (const realm of [_globalThis]) {
  const read = realm => {
    const iterator = _getIteratorMethod(realm.Array.prototype);
    return iterator;
  };
  use(read(other));
}