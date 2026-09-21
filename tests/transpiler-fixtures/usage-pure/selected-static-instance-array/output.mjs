import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// The selected value needs its static entry or instance dispatch.
// Preserve the user branch and evaluate every key and receiver once.
const [_ref, _ref2] = [flag ? Object : user, 0],
  _ref3 = _ref,
  entries = null == _ref3 ? _ref3[""] : _ref3 === Object ? _Object$entries : _entries(_ref3),
  tail = _ref2;
export { entries };