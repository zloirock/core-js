import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
var _ref2;
// The selected value needs its static entry or instance dispatch.
// Preserve the user branch and evaluate every key and receiver once.
const _ref = flag ? Object : user,
  entries = null == _ref ? _ref[""] : (effect(), (_ref2 = _ref === Object ? _Object$entries : _entries(_ref)) === void 0 ? fallback() : _ref2);
export { entries };