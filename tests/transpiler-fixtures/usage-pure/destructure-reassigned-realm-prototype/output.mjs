import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
// A reassigned realm alias retains its prefix and dispatches on the actual prototype.
// Every written alternative yields an array receiver or throws before the method read.
let effects = 0;
let realm = _globalThis;
const rebind = () => {
  realm = {};
};
const {
    Array: {
      prototype: _ref
    }
  } = (effects++, realm),
  at = _atMaybeArray(_ref),
  values = _valuesMaybeArray(_ref);