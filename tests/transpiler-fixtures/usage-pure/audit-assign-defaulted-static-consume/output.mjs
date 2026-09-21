import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// Defaults on known static slots remain dead; instance slots retain their runtime guards.
// Array wrappers preserve sibling bindings and the source assignment value.
let o;
[{
  of: o = fb
}] = [{
  of: _Array$of
}];
use(o);
let m;
m = (_ref = _at(arr)) === void 0 ? fb : _ref;
use(m);
let k, other;
[{
  findIndex: k = fb
}, other] = [arr, 1];
k = (_ref2 = _findIndexMaybeArray(arr)) === void 0 ? k : _ref2;
use(k, other);