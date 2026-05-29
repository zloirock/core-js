// An inherited instance method calling `this.makeItems()` narrows by the base return type,
// but a subclass overrides the method with an incompatible return. Bail to general.
class Base {
  makeItems(): number[] { return []; }
  first() { return this.makeItems().at(-1); }
}
class Sub extends Base {
  makeItems(): any { return "shadowed"; }
}
new Sub().first();
