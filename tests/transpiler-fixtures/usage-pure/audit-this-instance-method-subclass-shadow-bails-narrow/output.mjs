import _at from "@core-js/pure/actual/instance/at";
// An inherited instance method calling `this.makeItems()` narrows by the base return type,
// but a subclass overrides the method with an incompatible return. Bail to general.
class Base {
  makeItems(): number[] {
    return [];
  }
  first() {
    var _ref;
    return _at(_ref = this.makeItems()).call(_ref, -1);
  }
}
class Sub extends Base {
  makeItems(): any {
    return "shadowed";
  }
}
new Sub().first();