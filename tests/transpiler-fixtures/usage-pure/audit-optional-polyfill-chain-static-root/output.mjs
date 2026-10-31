import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// optional chain whose root is a polyfillable static call: the chain guard must wrap
// the rewrite of the static call correctly.
// chain-depth coverage: same `.at` per level is intentional, drives chain-walker reach
null == (_ref = _Array$from([[1]])) ? void 0 : _at(_ref2 = _at(_ref3 = _atMaybeArray(_ref).call(_ref, 0)).call(_ref3, 0)).call(_ref2, 0);