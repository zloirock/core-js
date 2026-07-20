import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref3;
const _ref2 = getObj();
const at = (_ref = _at(_ref2)) === void 0 ? fallback : _ref;
const flat = (_ref3 = _flatMaybeArray(_ref2)) === void 0 ? other : _ref3;