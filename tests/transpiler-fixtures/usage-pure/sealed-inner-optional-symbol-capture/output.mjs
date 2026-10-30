import _getIterator from "@core-js/pure/actual/get-iterator";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A sealed symbol call keeps the inner optional receiver through its key and argument.
// The nullish branch skips the key, then evaluates the argument before throwing.
export function read(box) {
  var _ref;
  return ((box == null ? void 0 : (_ref = box.rows, key(), _getIteratorMethod(_ref))) || 0).call(_ref, argument());
}
// A nullish tail still evaluates the key before the whole-call helper rejects it.
export function iterate(box) {
  var _ref2;
  return _getIterator(box == null ? void 0 : (_ref2 = box.rows, key(), _ref2));
}