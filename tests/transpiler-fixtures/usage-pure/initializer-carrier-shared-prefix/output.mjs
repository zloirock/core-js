import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// Two extracted reads share one initializer prefix.
const {
    Array: {
      prototype: _ref
    }
  } = (effect(), _globalThis),
  method = _atMaybeArray(_ref),
  contains = _includesMaybeArray(_ref);
use(method, contains);