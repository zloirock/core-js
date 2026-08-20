class A {
  foo() { return 'hello'; }
}
class B extends A {}
class C extends B {}
const c = new C();
c.foo().at(0);
