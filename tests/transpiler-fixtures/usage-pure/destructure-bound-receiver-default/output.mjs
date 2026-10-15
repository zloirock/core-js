import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// A bound array default remains a receiver fact for the next nested destructuring.
// A present receiver must receive the polyfills even when its sibling default stays dead.
const {
  x = [5, [6]]
} = {};
const {
    w: _ref = [1, [2]]
  } = {
    w: x
  },
  at = _atMaybeArray(_ref),
  flat = _flatMaybeArray(_ref);