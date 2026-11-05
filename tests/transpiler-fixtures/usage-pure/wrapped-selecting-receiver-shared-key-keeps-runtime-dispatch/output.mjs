import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// Shared-name instance keys keep runtime dispatch through selecting receivers.
// Static branches are served without replacing a user object's own entries, keys or values.
function viaParamDefault(_ref = [c ? Object : userObj]) {
  let [_ref2] = _ref;
  let e = _entries(_ref2);
  return e;
}
const {
    w: _ref3
  } = {
    w: c ? Object : userObj
  },
  viaKeyed = _ref3 === Object ? _Object$keys : _keys(_ref3);
const {
    w: _ref4
  } = {
    w: [c ? Object : userObj]
  },
  [_ref5] = _ref4,
  viaKeyedArray = _ref5 === Object ? _Object$values : _values(_ref5);
export { viaParamDefault, viaKeyed, viaKeyedArray };