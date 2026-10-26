import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A body declaration shadows the function expression name; calls use that local receiver.
export var f = function coord() {
  var coord = g();
  _pushMaybeArray(coord).call(coord, 1);
};