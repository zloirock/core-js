import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref, _ref2, _ref3;
// A guarded receiver reused by an outer dispatch must still be found when comments or whitespace separate it from its optional
// connector.
const a = {
  b: {
    c: [[1], [2]]
  }
};
null == (_ref = a.b /* keep me */) ? void 0 : _flatMaybeArray(_ref2 = _sliceMaybeArray(_ref3 = _ref.c).call(_ref3, 1)).call(_ref2, 2);