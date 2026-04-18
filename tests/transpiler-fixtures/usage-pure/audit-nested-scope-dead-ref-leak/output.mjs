import _includes from "@core-js/pure/actual/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
const f = x => {
  var _ref, _ref2;
  return null == (_ref = null == (_ref2 = x == null ? void 0 : _at(x).call(x, 0)) ? void 0 : _at(_ref2).call(_ref2, 0)) ? void 0 : _includes(_ref).call(_ref, 1);
};