import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A retained native default keeps its binding name and owned comment before lowering.
let method;
({
  slot: {
    at: method = /* default body */() => {
      var _ref;
      return _atMaybeArray(_ref = _Array$from([4, 9])).call(_ref, -1);
    }
  }
} = {
  slot: {}
});