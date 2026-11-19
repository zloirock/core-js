import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref, _ref2, _ref3;
// A gap on BOTH connectors, and one trailing the leaf: every boundary read the needle machinery
// does must skip the gap, including the end-of-needle case where only a comment follows the root.
const t = {
  u: {
    v: [[3], [4]]
  }
};
null == (_ref = t.u /* one */) ? void 0 : _flatMaybeArray(_ref2 = _sliceMaybeArray(_ref3 = _ref.v /* two */).call(_ref3, 0) /* three */).call(_ref2, 1);