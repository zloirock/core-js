import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// A static declaration and a sibling expression arrow keep independent claims.
// The arrow captures its receiver inside its own body.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  val = (() => {
    var _ref;
    return _valuesMaybeArray(_ref = []).call(_ref);
  })();
export { from, val };