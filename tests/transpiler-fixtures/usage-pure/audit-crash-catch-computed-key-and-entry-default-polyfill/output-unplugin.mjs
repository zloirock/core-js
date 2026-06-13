import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// catch destructure with a polyfill in an entry prop's DEFAULT (`it = [9].flat()`) AND in a
// non-entry prop's computed KEY (`[[1].at(0)]`). both drain paths (entry-default compose +
// whole-prop key compose) must coexist over the single `_ref` overwrite without orphaning either.
// the entry is listed FIRST so both plugins evaluate keys/defaults in source order: the AST-based
// plugin hoists an entry's extraction above the residual destructure, so a non-entry polyfilled
// key placed before the entry would reorder the ops between the two plugins. regression lock
try {} catch (_ref) {
var _ref3, _ref4;
let _ref2, it = (_ref2 = _getIteratorMethod(_ref)) === void 0 ? _flatMaybeArray(_ref3 = [9]).call(_ref3) : _ref2;
let { [_atMaybeArray(_ref4 = [1]).call(_ref4, 0)]: b } = _ref; b; it; }