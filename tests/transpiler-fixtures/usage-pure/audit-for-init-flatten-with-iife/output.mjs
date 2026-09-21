import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// A loop initializer keeps its static binding beside a function with a local receiver temporary.
let result = 0;
for (let {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  }, kls = (() => {
    var _ref;
    return _valuesMaybeArray(_ref = []).call(_ref);
  })(); result < 1; result++) {
  result = from([1]).length;
}
export { result };