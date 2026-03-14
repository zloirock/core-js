import "core-js/modules/es.function.name";
import "core-js/modules/es.string.at";
class Foo {
  bar() {
    return 'hello';
  }
}
const foo = new Foo();
const fn = foo.bar;
fn.name.at(0);