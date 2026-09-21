import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// An effectful sibling before the nested static keeps its position and local receiver temporary.
const kls = (() => {
    var _ref;
    return _valuesMaybeArray(_ref = []).call(_ref);
  })(),
  {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  };
export { from, kls };