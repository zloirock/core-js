import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A shorthand slot denotes the local binding's value just like an explicit property.
// Its native from read preserves Array result inference for the later at call.
const Array = _globalThis.Array;
const wrapper = {
  Array
};
const {
  Array: {
    from
  }
} = wrapper;
_atMaybeArray(_ref = from(['x'])).call(_ref, 0);