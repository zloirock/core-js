import _at from "@core-js/pure/actual/instance/at";
// a subclass static method writes the inherited static field via `super.data = ...`, mutating the
// same slot the base's static method reads through `this.data`. the narrow to the base initialiser
// type is unsound - the `.at()` polyfill degrades to the generic instance variant.
class Base {
  static data = [1, 2, 3];
  static read() {
    var _ref;
    return _at(_ref = this.data).call(_ref, 0);
  }
}
class Sub extends Base {
  static init() {
    super.data = "hello";
  }
}