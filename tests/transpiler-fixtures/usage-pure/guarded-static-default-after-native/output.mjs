import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2;
// A native sibling runs before the guarded default at the pattern's edge.
// Rebinding the source in that sibling cannot change the guarded read's receiver.
let M = pickConstructor();
if (!M) M = Array;
const {
    before = (M = {}, 1)
  } = (_ref = M, _ref),
  method = _ref === Array ? _Array$of : (_ref2 = _ref.of) === void 0 ? fallback() : _ref2;
export { before, method };