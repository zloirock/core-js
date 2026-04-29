import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.filter";
class Foo {
  *iter() {
    yield 1;
  }
}
new Foo().iter().filter(fn);