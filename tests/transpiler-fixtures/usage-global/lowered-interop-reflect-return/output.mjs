require("core-js/modules/es.object.to-string");
require("core-js/modules/es.promise.constructor");
require("core-js/modules/es.promise.catch");
require("core-js/modules/es.promise.finally");
require("core-js/modules/es.promise.resolve");
require("core-js/modules/es.array.iterator");
require("core-js/modules/es.array.from-async");
require("core-js/modules/es.array.at");
require("core-js/modules/es.array.concat");
require("core-js/modules/es.array.copy-within");
require("core-js/modules/es.array.entries");
require("core-js/modules/es.array.fill");
require("core-js/modules/es.array.filter");
require("core-js/modules/es.array.find");
require("core-js/modules/es.array.find-index");
require("core-js/modules/es.array.find-last");
require("core-js/modules/es.array.find-last-index");
require("core-js/modules/es.array.flat");
require("core-js/modules/es.array.flat-map");
require("core-js/modules/es.array.from");
require("core-js/modules/es.array.includes");
require("core-js/modules/es.array.join");
require("core-js/modules/es.array.keys");
require("core-js/modules/es.array.map");
require("core-js/modules/es.array.of");
require("core-js/modules/es.array.push");
require("core-js/modules/es.array.slice");
require("core-js/modules/es.array.sort");
require("core-js/modules/es.array.species");
require("core-js/modules/es.array.splice");
require("core-js/modules/es.array.to-reversed");
require("core-js/modules/es.array.to-sorted");
require("core-js/modules/es.array.to-spliced");
require("core-js/modules/es.array.unscopables.flat");
require("core-js/modules/es.array.unscopables.flat-map");
require("core-js/modules/es.array.values");
require("core-js/modules/es.array.with");
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