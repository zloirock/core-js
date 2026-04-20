import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
null == (_ref = a?.b) ? void 0 : _flatMaybeArray(_ref2 = _ref()).call(_ref2);
null == (_ref3 = a?.b) ? void 0 : _flatMaybeArray(_ref4 = _ref3[0]).call(_ref4);
null == (_ref5 = a?.b?.c) ? void 0 : _at(_ref6 = _ref5()).call(_ref6, 0);
a == null ? void 0 : _at(_ref7 = a(b)).call(_ref7, 0);