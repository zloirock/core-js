import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref2;
// A polyfilled static key is surrounded by effectful computed siblings.
// Key effects and sibling reads stay in source order, the source receiver is shared,
// and every original binding remains present.
const _ref = Array,
  {
    [(before(), 'x')]: x
  } = _ref,
  f = (effectful(), _Array$from),
  {
    [(after(), 'y')]: y
  } = _ref;
const doubled = _flatMaybeArray(_ref2 = [1, [2]]).call(_ref2);