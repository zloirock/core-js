import _Array$from from "@core-js/pure/actual/array/from";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref;
// Both static properties under one constructor receive their independent pure values.
const {
  Array: {
    from: f,
    of: o
  }
} = {
  Array: {
    from: _Array$from,
    of: _Array$of
  }
};
const result = _concatMaybeArray(_ref = f([1])).call(_ref, o(2));
export { result };