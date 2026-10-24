import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
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
export const result = box.data.includes('02');