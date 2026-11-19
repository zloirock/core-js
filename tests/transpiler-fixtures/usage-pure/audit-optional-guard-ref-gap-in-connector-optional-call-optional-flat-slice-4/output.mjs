import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref, _ref2, _ref3;
// A gap TRAILING the last hop only: the boundary reads before `?.` see no gap here, and the
// end-of-chain comment must neither confuse the needle nor survive into a wrong slot.
const p = {
  q: {
    r: [[5], [6]]
  }
};
null == (_ref = p.q) ? void 0 : _flatMaybeArray(_ref2 = _sliceMaybeArray(_ref3 = _ref.r).call(_ref3, 1)).call(_ref2, 0) /* tail */;