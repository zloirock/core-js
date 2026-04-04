import "core-js/modules/es.string.at";
class Base {
  foo() {
    return 'hello';
  }
}
class Child extends Base {}
const c = new Child();
c.foo().at(0);