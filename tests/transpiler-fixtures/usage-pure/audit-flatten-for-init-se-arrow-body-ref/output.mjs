import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// A loop initializer retains its prefix IIFE and the instance call inside it.
// The function owns its receiver temporary before the static binding initializes.
for (const {
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
}); false;) from([]);