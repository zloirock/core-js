import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
class C extends globalThis['Array'] {
  static fromX(x) {
    return super.from(x);
  }
}