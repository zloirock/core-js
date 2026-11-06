import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// The selected value needs its static entry or instance dispatch.
// Preserve the user branch and evaluate every key and receiver once.
const {
    w: _ref
  } = {
    w: flag ? Object : user
  },
  entries = _ref === Object ? _Object$entries : _entries(_ref);
export { entries };