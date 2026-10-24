import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
class A extends Array {
  static f(x) {
    return super.from(x);
  }
}