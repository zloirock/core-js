import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A returned function is an unread replacement for an existing method.
function make() {
  return function () {
    this.data = '1020';
  };
}
class Box {
  data = [10, 20];
  change() {}
}
const box = new Box();
box.change = make();
box.change();
export const result = _includes(_ref = box.data).call(_ref, '02');