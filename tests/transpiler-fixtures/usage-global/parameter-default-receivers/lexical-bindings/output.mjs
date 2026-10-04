import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// Receiver capture in a parameter default keeps its enclosing lexical environment.
// this, super, arguments and new.target still refer to the source method or constructor.
class Base {
  get data() {
    return [1, [2]];
  }
}
export class Box extends Base {
  read(value = this.data.at(0), found = super.data.includes(1), last = arguments[0]?.data.findLast(Boolean)) {
    return [value, found, last];
  }
}
function Build(value = new.target.data.flat()) {
  this.value = value;
}
Build.data = [1, [2]];
export const constructor = Build;