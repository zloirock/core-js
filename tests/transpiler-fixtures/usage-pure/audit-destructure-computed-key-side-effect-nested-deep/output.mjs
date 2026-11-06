import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// A computed static key two levels deep follows both receiver hops once.
// The key precedes the served from binding; the independent includes call is also polyfilled.
const {
    a: {
      b: {}
    }
  } = {
    a: {
      b: Array
    }
  },
  f = (effectful(), _Array$from);
const probe = _includesMaybeArray(_ref = [1, 2]).call(_ref, 2);