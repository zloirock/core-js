require("core-js/modules/es.object.to-string");
require("core-js/modules/es.array.from");
require("core-js/modules/es.string.iterator");
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