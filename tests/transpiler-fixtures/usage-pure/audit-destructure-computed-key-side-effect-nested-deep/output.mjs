import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref3;
// A computed static key two levels deep follows both receiver hops.
// Its effect runs once before the source binding is initialized with the pure method.
// The independent instance call remains polyfilled.
const {
    a: {
      b: _ref
    }
  } = {
    a: {
      b: Array
    }
  },
  _ref2 = _ref,
  f = null == _ref2 ? _ref2[""] : (effectful(), _Array$from);
const probe = _includesMaybeArray(_ref3 = [1, 2]).call(_ref3, 2);