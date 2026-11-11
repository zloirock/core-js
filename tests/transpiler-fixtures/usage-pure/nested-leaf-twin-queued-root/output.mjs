import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// The earlier claim and nested leaf share the computed root.
// The surviving nested binding is read after both method slots.
const _ref = make();
const includes = _includes(_ref),
  _ref2 = _ref.data,
  method = _at(_ref2),
  {
    other: {
      value
    }
  } = _ref2;
use(includes, method, value);