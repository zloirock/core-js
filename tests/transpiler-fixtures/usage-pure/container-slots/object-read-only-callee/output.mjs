import _entries from "@core-js/pure/actual/instance/entries";
import _Object$entries from "@core-js/pure/actual/object/entries";
// A container passed to a local read-only callee is subsequently read through its constructor slot.
const readOnlyCalleeStillBails = function () {
  function onlyReads(t) {
    return t.k;
  }
  const readOnlyEscape = {
    k: Object
  };
  onlyReads(readOnlyEscape);
  const {
      k: _ref
    } = readOnlyEscape,
    entries = _ref === Object ? _Object$entries : _entries(_ref);
  return entries;
}();
export { readOnlyCalleeStillBails };