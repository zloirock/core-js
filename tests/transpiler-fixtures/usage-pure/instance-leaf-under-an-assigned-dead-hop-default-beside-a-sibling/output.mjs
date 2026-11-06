import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2, _ref3;
// An assigned literal supplies the live nested instance receiver beside an outer sibling.
// The captured slot supplies the instance helper; the dead hop default never runs.
let fl, zw;
const holder = {
  list: [1, 2]
};
_ref = {
  w: {
    y: holder.list
  },
  zw: 1
}, {
  w: _ref2 = {
    y: [1]
  }
} = _ref, {
  y: _ref3
} = _ref2, fl = _flatMaybeArray(_ref3), {
  zw
} = _ref;