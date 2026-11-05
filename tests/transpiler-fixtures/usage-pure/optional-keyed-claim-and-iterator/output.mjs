import _getIterator from "@core-js/pure/actual/get-iterator";
import _at from "@core-js/pure/actual/instance/at";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
// Check key and argument order across a live call, a missing method and a sealed lookup.
export function run(box, key, arg) {
  var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
  const read = box == null ? void 0 : (_ref = box.rows, key(), _at(_ref));
  const value = null == (_ref2 = box == null ? void 0 : (_ref3 = box.rows, key(), _at(_ref3)?.call(_ref3, arg()))) ? void 0 : _toFixedMaybeNumber(_ref2).call(_ref2, 0);
  const item = null == (_ref4 = box.make) ? void 0 : (_ref5 = _ref4.call(box), key(), _getIterator(_ref5)).next().value;
  const sealed = ((null == (_ref6 = box?.rows) ? void 0 : (key(), _at(_ref6))) || 0).call(_ref6, arg());
  return [read, value, item, sealed];
}