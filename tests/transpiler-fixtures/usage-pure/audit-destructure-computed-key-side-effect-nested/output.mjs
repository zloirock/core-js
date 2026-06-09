import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
const f = _Array$from;
// nested destructure with a side-effecting computed key (`[(eff(), "from")]`) resolving to a
// polyfillable static through a static-object wrapper. both plugins keep the key IN PLACE (value renamed
// to a throwaway, effect once) and bind the polyfill separately - identical handling to the non-nested
// case (one residual path) - so the polyfill ALWAYS wins (a present-but-buggy native is replaced too)
const {
  x: {
    [(effectful(), "from")]: _unused
  }
} = {
  x: Array
};
const doubled = _flatMaybeArray(_ref = [1, [2]]).call(_ref);