import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Removing an own field can reveal a different inherited receiver family.
const effects = [];
class Base {
  get data() {
    return "pq";
  }
}
class Box extends Base {
  data = [8, 9];
  remove() {
    delete this.data;
  }
}
const box = new Box();
box.remove();
const r = _at(_ref = box.data).call(_ref, -1);
use(r, effects);