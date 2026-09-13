import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Nested sibling branches combine a static Array key and an instance array key.
// Each branch reads its receiver, evaluates its key prefix, and initializes its
// binding in source order; both bindings receive the corresponding polyfill.
const arr = [1, [2]];
const _ref2 = {
    x: Array,
    y: arr
  },
  {
    x: _ref
  } = _ref2,
  _ref3 = _ref,
  f = null == _ref3 ? _ref3[""] : (before(), _Array$from),
  {
    y: _ref4
  } = _ref2,
  _ref5 = _ref4,
  m = null == _ref5 ? _ref5[""] : (after(), _flatMaybeArray(_ref5));