import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
class C extends self.Array {
  static fromX(x) {
    return super.from(x);
  }
}