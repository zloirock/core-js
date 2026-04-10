import _includes from "@core-js/pure/actual/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
const f = x => {
  var _ref, _ref2, _ref3, _ref4, _ref5;
  return _includes(_ref = _at(_ref5 = _flatMaybeArray(_ref3 = getArr(x)).call(_ref3)).call(_ref5, -1)).call(_ref, 1);
};