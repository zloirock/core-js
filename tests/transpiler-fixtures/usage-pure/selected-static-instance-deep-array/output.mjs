import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// The selected value needs its static entry or instance dispatch.
// Preserve the user branch and evaluate every key and receiver once.
const [[_ref]] = [[flag ? Object : user]],
  _ref2 = _ref,
  entries = null == _ref2 ? _ref2[""] : _ref2 === Object ? _Object$entries : _entries(_ref2);
export { entries };