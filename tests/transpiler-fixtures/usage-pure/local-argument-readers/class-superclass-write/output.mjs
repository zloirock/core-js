import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Returning a superclass exposes the inherited static field to writes.
function pick(o) {
  return o.__proto__;
}
class Base {
  static rows = [8, 9];
}
class Box extends Base {}
const held: any = pick(Box);
held.rows = "ab";
use(_at(_ref = Box.rows).call(_ref, -1));