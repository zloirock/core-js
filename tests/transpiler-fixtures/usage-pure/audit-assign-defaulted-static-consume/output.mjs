import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// Instance defaults guard the extracted method and preserve array siblings.
// The static-only Array.of wrapper keeps its native read and default.
let o;
[{
  of: o = fb
}] = [Array];
use(o);
let m;
[,] = [arr];
m = (_ref = _at(arr)) === void 0 ? fb : _ref;
use(m);
let k, other;
[, _ref2] = [arr, 1];
k = (_ref3 = _findIndexMaybeArray(arr)) === void 0 ? fb : _ref3;
other = _ref2;
use(k, other);