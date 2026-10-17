import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// Well-known-symbol patterns read the selected iterator method and retain nested defaults.
// Computed sibling keys and effectful receivers keep their order beside static and instance claims.
const obj = {
  Array: {
    from: _Array$from
  },
  [_Symbol$iterator]: _getIteratorMethod(Array.prototype)
};
const {
    Array: {
      from
    }
  } = obj,
  {
    next = _atMaybeArray(_ref = [1]).call(_ref, 0)
  } = _getIteratorMethod(obj);
export { from };
export { next };