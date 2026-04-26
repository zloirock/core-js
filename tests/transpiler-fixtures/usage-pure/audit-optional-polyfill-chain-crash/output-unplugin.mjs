import _at from "@core-js/pure/actual/instance/at";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2, _ref3;
// optional chain crossing a polyfillable site: the rewrite must not crash on any
// shape of the chain even when the polyfill site is deep in the chain.
const arr = [[[1]], [[2]]];
null == (_ref = _atMaybeArray(arr).call(arr, 0)) ? void 0 : _at(_ref2 = _atMaybeArray(_ref3 = _atMaybeArray(_ref).call(_ref, 0)).call(_ref3, 0)).call(_ref2, 0);