declare class Parent { items(): string[] }
class Child extends Parent {
  test() { return super.items(); }
}
declare const c: Child;
c.test().at(0);
