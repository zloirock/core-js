import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// A static declaration preserves instance polyfills in nested sibling function bodies.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  kls = (() => {
    if (true) {
      var _ref;
      return _valuesMaybeArray(_ref = []).call(_ref);
    }
    return null;
  })();
export { from, kls };