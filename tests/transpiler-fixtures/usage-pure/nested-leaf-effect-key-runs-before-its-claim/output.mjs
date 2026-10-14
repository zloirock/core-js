import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// a nested leaf whose claim spells its key with an effect: the key runs where the source wrote it, in the
// twin's residual, and the claim reads the memo after it - behind a leading binding and ahead of a
// trailing one alike
const _ref = p.y,
  {
    z: {
      w
    }
  } = _ref,
  a = (e(), _at(_ref));
const _ref2 = p.y,
  b = null == _ref2 ? _ref2[""] : (e(), _flatMaybeArray(_ref2)),
  {
    v: {
      x
    }
  } = _ref2;
use(w, a, b, x);