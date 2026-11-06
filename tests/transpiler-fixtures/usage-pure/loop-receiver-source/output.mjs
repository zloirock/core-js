import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// The receiver is the lexical loop binding, including a read moved into a closure.
for (const realm of [_globalThis]) {
  const at = _atMaybeArray(realm.Array.prototype);
  use(at);
}
for (const realm of [_globalThis, _globalThis]) {
  const read = () => {
    const includes = _includesMaybeArray(realm.Array.prototype);
    return includes;
  };
  use(read());
}
for (const realm of [_globalThis]) {
  const iterator = _getIteratorMethod((before(), realm.Array.prototype));
  use(iterator);
}
for (const realm of [_globalThis]) {
  before();
  const method = _getIteratorMethod(_WeakSet);
  use(method);
}