import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5;
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
[_ref] = [arr];
m = (_ref2 = _at(_ref)) === void 0 ? fb : _ref2;
use(m);
let k, other;
[_ref3, _ref4] = [arr, 1];
k = (_ref5 = _findIndexMaybeArray(_ref3)) === void 0 ? fb : _ref5;
other = _ref4;
use(k, other);