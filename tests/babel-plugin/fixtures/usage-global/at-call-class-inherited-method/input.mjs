class Base {
  foo() { return 'hello'; }
}
class Child extends Base {}
const c = new Child();
c.foo().at(0);
