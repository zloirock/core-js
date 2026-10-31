import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
var _ref;
// The selected value needs its static entry or instance dispatch.
// Preserve the user branch and evaluate every key and receiver once.
let entries;
const result = (_ref = flag ? Object : user, entries = _ref === Object ? _Object$entries : _entries(_ref), _ref);
export { entries };