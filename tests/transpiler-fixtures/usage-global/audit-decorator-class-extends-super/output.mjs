import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
// decorated class extending `Array` with a static method `super.from(...)`: the
// static-method call is rewritten through the polyfilled super constructor.
@decorator
class A extends Array {
  static f(x) {
    return super.from(x);
  }
}