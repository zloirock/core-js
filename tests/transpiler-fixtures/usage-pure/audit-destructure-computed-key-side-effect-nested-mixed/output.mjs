import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Static and instance claims in nested sibling branches retain their source order.
// Each effectful key runs before its own from or flat binding is initialized.
const arr = [1, [2]];
const _ref = {
    x: Array,
    y: arr
  },
  {
    x: {}
  } = _ref,
  f = (before(), _Array$from),
  {
    y: _ref2
  } = _ref,
  m = null == _ref2 ? _ref2[""] : (after(), _flatMaybeArray(_ref2));