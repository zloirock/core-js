import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
class C extends Array {
  static foo() {
    return super["from"]([1]);
  }
}