import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
const f = x => {
  var _ref, _ref2;
  return _includes(_ref = _at(_ref2 = getArr(x)).call(_ref2, -1)).call(_ref, 1);
};