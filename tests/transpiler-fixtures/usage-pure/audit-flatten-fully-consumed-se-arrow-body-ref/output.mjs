import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// An initializer prefix IIFE runs once before the static binding.
// Its instance call keeps a declared local receiver temporary.
const {
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
});
from([]);