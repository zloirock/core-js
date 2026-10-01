import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// The selected value needs its static entry or instance dispatch.
// Preserve the user branch and evaluate every key and receiver once.
const _ref = {
    before: 0,
    w: flag ? Object : user,
    after: 1
  },
  {
    before
  } = _ref,
  {
    w: _ref2
  } = _ref,
  entries = null == _ref2 ? _ref2[""] : (effect(), _ref2 === Object ? _Object$entries : _entries(_ref2)),
  {
    after
  } = _ref;
export { entries };