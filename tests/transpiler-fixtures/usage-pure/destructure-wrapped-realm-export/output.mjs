import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// Exported nested extraction through a non-null realm still needs the realm's polyfill.
// Neighboring declarators and the extracted exported bindings keep their source order.
const before = 1,
  {
    w: {
      Array: {
        prototype: _ref
      }
    }
  } = {
    w: _globalThis
  },
  at = _atMaybeArray(_ref),
  flat = _flatMaybeArray(_ref),
  after = 2;
export { before, at, flat, after };