import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// A following function keeps its instance polyfill independently of the preceding static declaration.
const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
const kls = (() => {
  var _ref;
  return _valuesMaybeArray(_ref = []).call(_ref);
})();
export { from, kls };