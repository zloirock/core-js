import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// A literal user container retains its native static read in the for-init header.
// The prefix and calls through that binding keep their independent instance polyfills.
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
})(), userGlobal); false;) {
  var _ref2;
  _atMaybeArray(_ref2 = from([])).call(_ref2, 0);
}