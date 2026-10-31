import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// for-loop init destructuring multiple instance-method properties: each property gets
// its own pure-mode instance polyfill alias.
for (const _ref = [[1, 2], [3]], at = _atMaybeArray(_ref), flat = _flatMaybeArray(_ref); false;) {
  at(0);
  flat();
}