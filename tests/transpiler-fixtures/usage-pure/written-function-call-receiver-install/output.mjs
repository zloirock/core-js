import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A written body can replace its own callable slot with another return family.
function make() {
  this.fn = () => 'abcd';
  return [1];
}
const box = {};
box.fn = make;
box.fn();
use(_includes(_ref = box.fn()).call(_ref, 'bc'));