import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
function viaParamDefault([{
  entries: e
}] = [{
  entries: _entries(c ? Object : userObj)
}]) {
  return e;
}
const {
    w: _ref
  } = {
    w: c ? Object : userObj
  },
  viaKeyed = _ref === Object ? _Object$keys : _keys(_ref);
const {
    w: _ref2
  } = {
    w: [c ? Object : userObj]
  },
  [_ref3] = _ref2,
  viaKeyedArray = _ref3 === Object ? _Object$values : _values(_ref3);
export { viaParamDefault, viaKeyed, viaKeyedArray };