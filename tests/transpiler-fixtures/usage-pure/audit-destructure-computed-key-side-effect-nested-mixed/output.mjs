import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Nested sibling branches combine a static Array key and an instance array key.
// Each branch reads its receiver, evaluates its key prefix, and initializes its
// binding in source order; both bindings receive the corresponding polyfill.
const arr = [1, [2]];
const _ref = {
    x: {
      from: _Array$from
    },
    y: arr
  },
  {
    x: {
      [(before(), 'from')]: f
    }
  } = _ref,
  {
    y: _ref2
  } = _ref,
  _ref3 = _ref2,
  m = null == _ref3 ? _ref3[""] : (after(), _flatMaybeArray(_ref3));