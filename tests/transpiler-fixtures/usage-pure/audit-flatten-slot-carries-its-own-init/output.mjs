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
const from = _Array$from;
const _ref = (log(), getArr());
const at = _atMaybeArray(_ref);
const concat = _concatMaybeArray(_ref);
const of = _Array$of;
const _ref2 = getArr();
const {
  indexOf
} = _ref2;
const _ref3 = _ref2;
const fl = null == _ref3 ? _ref3[""] : (k++, _flatMaybeArray(_ref3));
var f4 = _Object$entries;
var _ref4 = (eff(), Array);
var of4 = null == _ref4 ? _ref4[""] : (k4++, _Array$of);
var {
  other4
} = _ref4;
export { from, at, concat, of, indexOf, fl, f4, of4, other4 };