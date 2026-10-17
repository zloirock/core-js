import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
var _ref;
// prop-level default: the helper result is guarded (a memoized `=== void 0` test), so a genuinely
// non-iterable receiver still takes the user default like a raw undefined read would
const fb = {
  done: true
};
const nonIterable = {};
const {
  done
} = (_ref = _getIteratorMethod(nonIterable)) === void 0 ? fb : _ref;
export { done };