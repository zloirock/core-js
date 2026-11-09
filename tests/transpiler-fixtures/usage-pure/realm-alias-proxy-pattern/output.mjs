import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// A leading realm hop is peeled before extracting instance methods from an alias.
const realm = _globalThis;
const {
    Array: {
      prototype: _ref
    }
  } = _globalThis,
  at = _atMaybeArray(_ref),
  includes = _includesMaybeArray(_ref);
export { at, includes };