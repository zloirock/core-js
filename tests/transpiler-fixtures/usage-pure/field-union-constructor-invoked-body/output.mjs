import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// Constructing a class can invoke an installed static body through new.target.
// The field read must include the family written by that body.
function change() {
  this.data = '1020';
}
class Box {
  static data = [10, 20];
  constructor() {
    new.target.change();
  }
}
Box.change = change;
new Box();
export const result = _includes(_ref = Box.data).call(_ref, '02');