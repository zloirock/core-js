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
  _ref3 = _ref2,
  entries = null == _ref3 ? _ref3[""] : (effect(), _ref3 === Object ? _Object$entries : _entries(_ref3)),
  {
    after
  } = _ref;
export { entries };