import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims. Instance claims retain their own receivers.
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