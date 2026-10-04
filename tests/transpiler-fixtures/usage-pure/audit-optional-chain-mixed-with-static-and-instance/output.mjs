import _Array$from from "@core-js/pure/actual/array/from";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// Mix optional chain (`?.`) with static + instance polyfills: inner-substitution
// candidate ordering covers raw -> deoptionalized -> guardRef-rewritten paths
const f = x => {
  var _ref;
  return null == x || null == (_ref = _flatMaybeArray(x)?.call(x)) ? void 0 : _at(_ref)?.call(_ref, 0);
};
const g = x => {
  var _ref2;
  return null == (_ref2 = _Array$from(x)) ? void 0 : _findLastMaybeArray(_ref2)?.call(_ref2, p);
};