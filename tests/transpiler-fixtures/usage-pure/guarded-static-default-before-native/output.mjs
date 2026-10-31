import _Array$of from "@core-js/pure/actual/array/of";
var _ref, _ref2;
// A guarded default at the pattern's edge detaches before its native sibling.
// The sibling still reads the captured source after the default rebinds its variable.
let M = pickConstructor();
if (!M) M = Array;
const method = (_ref = M, _ref === Array ? _Array$of : (_ref2 = _ref.of) === void 0 ? (M = {}, 1) : _ref2),
  {
    extra
  } = _ref;
export { method, extra };