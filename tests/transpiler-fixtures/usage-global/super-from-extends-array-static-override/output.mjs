import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
class MyArray extends Array {
  static from(x) {
    return super.from(x);
  }
}