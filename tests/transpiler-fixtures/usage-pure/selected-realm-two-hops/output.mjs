import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Each optional boundary survives capturing the selected realm and constructor.
export function read(choice) {
  var _ref;
  return _ref = (choice ? _globalThis : null)?.Array, null == _ref ? void 0 : _ref === Array ? _Array$from([3]) : _ref.from([3]);
}