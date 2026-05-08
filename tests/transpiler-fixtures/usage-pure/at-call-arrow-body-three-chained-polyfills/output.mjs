import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
const f = x => {
  var _ref, _ref2, _ref3;
  return _includes(_ref = _at(_ref2 = _flatMaybeArray(_ref3 = getArr(x)).call(_ref3)).call(_ref2, -1)).call(_ref, 1);
};