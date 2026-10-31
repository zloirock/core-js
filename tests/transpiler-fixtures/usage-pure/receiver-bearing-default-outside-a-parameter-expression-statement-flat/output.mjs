import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// A receiver-bearing default supplies a ponyfill only when its source slot is undefined.
// A live supplied slot keeps the corresponding native destructuring read.
const src = {};
const list = [];
function use() {/* empty */}
const flat = _flatMaybeArray((_ref = src.i1) === void 0 ? list : _ref);
use(flat);