import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2;
// A nested static and an instance call share a declaration.
// The instance receiver temporary remains declared in the enclosing scope.
let {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  x = (sideEffect(), _atMaybeArray(_ref = [1, 2, 3]).call(_ref, -1));
let {
    Array: {
      of
    }
  } = {
    Array: {
      of: _Array$of
    }
  },
  y = (sideEffect(), _findLastMaybeArray(_ref2 = [4, 5, 6]).call(_ref2, v => v > 0));
export { from, x, of, y };