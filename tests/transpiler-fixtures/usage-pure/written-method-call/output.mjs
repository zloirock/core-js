import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Every implementation of the replaced method returns an array.
const box = {
  fn() {
    return [1];
  }
};
box.fn = () => [8, 9];
use(_atMaybeArray(_ref = box.fn()).call(_ref, -1));