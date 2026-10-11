import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// a key both the constructor and an instance carry, read through a wrapper level off a selecting receiver,
// keeps runtime dispatch: an identity guard on the constructor serves its static and the generic instance
// helper any other value - under a key or an array element under it - and a parameter's default hands
// the generic helper the arm it mirrors
function viaParamDefault([{
  entries: e
}] = [{
  entries: _entries(c ? {
    entries: _Object$entries
  } : userObj)
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