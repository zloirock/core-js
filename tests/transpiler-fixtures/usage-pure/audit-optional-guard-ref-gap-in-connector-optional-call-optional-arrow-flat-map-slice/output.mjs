import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref, _ref2, _ref3;
// The root itself is parenthesized with an inner trailing comment: the memoized value is the
// paren expression, and the comment stays inside the memo assignment.
const s = {
  t: {
    u: [[7]]
  }
};
null == (_ref = s.t /* in */) ? void 0 : _flatMapMaybeArray(_ref2 = _sliceMaybeArray(_ref3 = _ref.u).call(_ref3, 0)).call(_ref2, v => v);