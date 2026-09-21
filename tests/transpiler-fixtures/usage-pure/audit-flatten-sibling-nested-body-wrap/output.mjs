import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Nested arrow bodies beside a static each retain their instance calls and local temporaries.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  sibling = () => {
    var _ref;
    return _atMaybeArray(_ref = [1]).call(_ref, 0) + (() => {
      var _ref2;
      return _atMaybeArray(_ref2 = [2]).call(_ref2, 0);
    })();
  };
console.log(from, sibling());