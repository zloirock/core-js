import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
const f = _Array$from;
// a side-effecting computed key TWO levels deep. the key is kept in place (value renamed to a throwaway,
// effect once) and the polyfill bound separately - the same residual path as every depth. polyfill wins
const {
  a: {
    b: {
      [(effectful(), 'from')]: _unused
    }
  }
} = {
  a: {
    b: Array
  }
};
const probe = _includesMaybeArray(_ref = [1, 2]).call(_ref, 2);