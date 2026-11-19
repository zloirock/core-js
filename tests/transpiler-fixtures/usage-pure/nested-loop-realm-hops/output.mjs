import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// The loop binding keeps its identity after redundant realm hops are removed.
for (const realm of [_globalThis]) {
  const at = _atMaybeArray(realm.Array.prototype);
  const includes = _includesMaybeArray(realm.Array.prototype);
  use(at, includes);
}