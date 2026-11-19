import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
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
const r = box.data.at(-1);
use(r, effects);