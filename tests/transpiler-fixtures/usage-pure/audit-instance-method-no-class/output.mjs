import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// instance method `[].values()` inside sibling without computed-key. tests if simpler
// instance dispatch in sibling-receiver context still works
const from = _Array$from;
const kls = (() => {
  var _ref;
  return _valuesMaybeArray(_ref = []).call(_ref);
})();
export { from, kls };