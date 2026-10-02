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
use(Box.rows.at(-1));
