import _Array$from from "@core-js/pure/actual/array/from";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// Two sibling IIFEs retain separate local receiver temporaries and their own instance polyfills.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  kls1 = (() => {
    var _ref;
    return _valuesMaybeArray(_ref = []).call(_ref);
  })(),
  kls2 = (() => {
    var _ref2;
    return _keysMaybeArray(_ref2 = []).call(_ref2);
  })();
export { from, kls1, kls2 };