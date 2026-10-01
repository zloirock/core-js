import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// A loop initializer keeps its effectful function call before the static binding.
// The function retains its instance polyfill and local receiver temporary.
for (let idx = 0, {
    Array: {
      from
    }
  } = ((() => {
    var _ref;
    return _valuesMaybeArray(_ref = []).call(_ref);
  })(), {
    Array: {
      from: _Array$from
    }
  }); idx < 1; idx++) from([idx]);