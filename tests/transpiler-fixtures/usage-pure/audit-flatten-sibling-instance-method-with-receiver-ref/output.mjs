import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
// A nested static shares its declaration with an arrow using a global receiver and an instance call.
// Both rewrites survive and the arrow owns its receiver temporary.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  val = () => {
    var _ref;
    return _valuesMaybeArray(_ref = [_globalThis]).call(_ref);
  };
console.log(from, val());