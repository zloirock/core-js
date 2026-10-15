import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
var _ref;
// A constant computed key names the same guarded static as a plain key.
// Each source slot is read once and keeps its position in the pattern.
let M = pickConstructor();
if (!M) M = Array;
const key = 'of';
const from = (_ref = M, _ref === Array ? _Array$from : _ref.from),
  method = _ref === Array ? _Array$of : _ref.of;
export { from, method };