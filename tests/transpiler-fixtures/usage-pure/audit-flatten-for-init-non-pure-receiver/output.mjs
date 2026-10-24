import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
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