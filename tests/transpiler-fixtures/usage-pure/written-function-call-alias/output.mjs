import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A stable named function is assigned through a local receiver alias.
function make() {
  return [8, 9];
}
const box = {};
const alias = box;
alias.fn = make;
use(_atMaybeArray(_ref = box.fn()).call(_ref, -1));