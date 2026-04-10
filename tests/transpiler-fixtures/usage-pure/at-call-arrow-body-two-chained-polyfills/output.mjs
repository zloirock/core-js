import _includes from "@core-js/pure/actual/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
const f = x => {
  var _ref, _ref2, _ref3;
  return _includes(_ref = _at(_ref3 = getArr(x)).call(_ref3, -1)).call(_ref, 1);
};