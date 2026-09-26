import _Object$assign from "@core-js/pure/actual/object/assign";
var _ref, _ref2;
// A consumed assignment yields its selected receiver and dispatches its static by identity.
// The value-discarding statement keeps the branch mirror.
let a1, a2, a3, a4;
const shim = null;
const host1 = (_ref = shim || Object, a1 = _ref === Object ? _Object$assign : _ref["assign"], _ref);
let host2;
host2 = (_ref2 = shim ? shim : Object, a2 = _ref2 === Object ? _Object$assign : _ref2["assign"], _ref2);
export function reader() {
  var _ref3;
  return _ref3 = shim || Object, a3 = _ref3 === Object ? _Object$assign : _ref3["assign"], _ref3;
}
({
  assign: a4
} = shim || {
  assign: _Object$assign
});
console.log(host1, host2, a1, a2, a3, a4);