import _at from "@core-js/pure/actual/instance/at";
// A static getter read through `this` resolves against the lexical class, but the inherited
// static method runs with `this` bound to the subclass, whose getter override returns an
// incompatible type. The narrow must bail to the general instance variant.
class Base {
  static get items(): number[] {
    return [1, 2, 3];
  }
  static first() {
    var _ref;
    return _at(_ref = this.items).call(_ref, -1);
  }
}
class Sub extends Base {
  static get items(): any {
    return "shadowed";
  }
}
Sub.first();