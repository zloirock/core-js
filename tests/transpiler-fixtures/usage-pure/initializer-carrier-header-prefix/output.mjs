import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// A loop initializer keeps one prefix ahead of its extracted reads.
for (let {
    prototype: _ref
  } = (effect(), _globalThis.Array), method = _atMaybeArray(_ref), contains = _includesMaybeArray(_ref), once = true; once; once = false) {
  use(method, contains);
}