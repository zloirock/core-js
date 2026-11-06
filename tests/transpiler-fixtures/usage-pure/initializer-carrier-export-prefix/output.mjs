import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// Exported extracted bindings share the prefix before their values.
const {
    Array: {
      prototype: _ref
    }
  } = (effect(), _globalThis),
  method = _atMaybeArray(_ref),
  contains = _includesMaybeArray(_ref);
export { method, contains };