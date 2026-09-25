import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$entries from "@core-js/pure/actual/object/entries";
// Each destructure initializer and its sequence effects run once at the original declaration slot.
// Claimed and residual siblings retain their own computed-key effects and polyfill rewrites.
let k = 0;
let k4 = 0;
function log() {}
function eff() {}
function getArr() {
  return [1];
}
const {
  Array: {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
const _ref = (log(), getArr());
const at = _atMaybeArray(_ref);
const concat = _concatMaybeArray(_ref);
const {
    Array: {
      of
    }
  } = {
    Array: {
      of: _Array$of
    }
  },
  _ref2 = getArr(),
  {
    indexOf
  } = _ref2,
  fl = null == _ref2 ? _ref2[""] : (k++, _flatMaybeArray(_ref2));
var {
    Object: {
      entries: f4
    }
  } = {
    Object: {
      entries: _Object$entries
    }
  },
  _ref3 = (eff(), Array),
  of4 = (k4++, _Array$of),
  {
    other4
  } = _ref3;
export { from, at, concat, of, indexOf, fl, f4, of4, other4 };