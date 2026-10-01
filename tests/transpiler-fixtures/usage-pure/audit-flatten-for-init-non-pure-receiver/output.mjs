import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// A user container holding Array resolves its nested static in a loop initializer.
// The prefix function and calls through the binding keep their independent instance polyfills.
const userGlobal = {
  Array
};
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
}); false;) {
  var _ref2;
  _atMaybeArray(_ref2 = from([])).call(_ref2, 0);
}