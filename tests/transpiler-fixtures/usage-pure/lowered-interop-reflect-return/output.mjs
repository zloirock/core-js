// Module interop preserves the pure invoker's identity through its default slot.
var invoke = _interopRequireDefault(require('@core-js/pure/actual/reflect/apply'));
function _interopRequireDefault(value) {
  return value && value.__esModule ? value : {
    default: value
  };
}
function pick(value) {
  return {
    value
  };
}
(0, invoke.default)(pick, null, [Array]).value.from = patched;
exports.result = Array.from([1]);