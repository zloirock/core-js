import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/esnext.async-iterator.constructor";
import "core-js/modules/esnext.async-iterator.filter";
class Foo {
  async *iter() {
    yield 1;
  }
}
new Foo().iter().filter(fn);