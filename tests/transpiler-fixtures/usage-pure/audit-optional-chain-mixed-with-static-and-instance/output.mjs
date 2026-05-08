import _Array$from from "@core-js/pure/actual/array/from";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// Mix optional chain (`?.`) with static + instance polyfills: substituteInner
// candidate ordering covers raw -> deoptionalized -> guardRef-rewritten paths
const f = x => {
  var _ref, _ref2;
  return null == x || null == (_ref = _flatMaybeArray(x)) || null == (_ref2 = _ref.call(x)) ? void 0 : _at(_ref2)?.call(_ref2, 0);
};
const g = x => {
  var _ref3;
  return null == (_ref3 = _Array$from(x)) ? void 0 : _findLastMaybeArray(_ref3)?.call(_ref3, p);
};