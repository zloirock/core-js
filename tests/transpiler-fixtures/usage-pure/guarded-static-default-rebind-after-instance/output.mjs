import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
var _ref, _ref2;
// A split guarded read follows an already-extracted instance slot.
// The remaining guarded siblings share the receiver even if the default rebinds its source.
// The AST drain emits those siblings as separate declarations after its queued instance read.
let M = pickConstructor();
if (!M) M = Array;
const first = _nameMaybeFunction(M);
const method = (_ref = M, _ref === Array ? _Array$of : (_ref2 = _ref.of) === void 0 ? (M = {}, 9) : _ref2),
  tail = _ref === Array ? _Array$from : _ref.from;
export { first, method, tail };