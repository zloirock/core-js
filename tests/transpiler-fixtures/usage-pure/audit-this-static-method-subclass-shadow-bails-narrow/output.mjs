import _at from "@core-js/pure/actual/instance/at";
// An inherited static method calling `this.makeItems()` narrows by the base return type, but
// the subclass overrides the static method with an incompatible return. Bail to general.
class Base {
  static makeItems(): number[] {
    return [];
  }
  static first() {
    var _ref;
    return _at(_ref = this.makeItems()).call(_ref, -1);
  }
}
class Sub extends Base {
  static makeItems(): any {
    return "shadowed";
  }
}
Sub.first();