import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// nested optional chains with two polyfilled instance calls share the same guard
// expression for the outer chain; inner `fn()?.at(0)` keeps its own independent guard.
null == (_ref = fn()) ? void 0 : _flatMaybeArray(_ref).call(_ref, null == (_ref2 = fn()) ? void 0 : _at(_ref2).call(_ref2, 0));