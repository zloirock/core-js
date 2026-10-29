import _getIterator from "@core-js/pure/actual/get-iterator";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _at from "@core-js/pure/actual/instance/at";
// Receiver prefixes precede computed keys; optional calls retain the selected receiver.
export function invoke(box, log) {
  var _ref;
  return _ref = (log('prefix'), box.rows), log('key'), _getIteratorMethod(_ref)?.call(_ref, log('argument'));
}

// A stable receiver still performs its first read before a key that can throw.
export function read(rows, log) {
  return log('prefix'), rows, log('key'), _getIteratorMethod(rows);
}

// A live inner guard skips both the key and the consumption when its base is absent.
export function guarded(box, log) {
  var _ref2;
  return box == null ? void 0 : (_ref2 = box.rows, log('key'), _getIterator(_ref2));
}

// Ordinary instance consumers share receiver evaluation with symbol consumers.
export function instance(box, log) {
  var _ref3;
  return _ref3 = (log('prefix'), box.rows), log('key'), _at(_ref3);
}