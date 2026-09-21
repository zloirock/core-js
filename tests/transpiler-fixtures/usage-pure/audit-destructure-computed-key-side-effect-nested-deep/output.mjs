import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// A computed static key two levels deep follows both receiver hops.
// Its effect runs once before the source binding is initialized with the pure method.
// The independent instance call remains polyfilled.
const {
  a: {
    b: {
      [(effectful(), 'from')]: f
    }
  }
} = {
  a: {
    b: {
      from: _Array$from
    }
  }
};
const probe = _includesMaybeArray(_ref = [1, 2]).call(_ref, 2);