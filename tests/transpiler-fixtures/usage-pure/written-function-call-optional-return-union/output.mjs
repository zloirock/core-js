import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// An optional call to an own function returns an array or a string.
// Its result needs both includes families, with no iterator variant.
const box = {};
box.map = () => flag ? [1] : "ab";
use(null == (_ref = box.map) ? void 0 : _includes(_ref2 = _ref.call(box)).call(_ref2, 1));