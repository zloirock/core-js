import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// A served optional method owns its receiver comment once.
// The receiver guard and later reads share the value, not the comment.
null == arr /* receiver */ || null == (_ref = _flatMaybeArray(arr)) ? void 0 : _at(_ref2 = _ref.call(arr)).call(_ref2, 0);