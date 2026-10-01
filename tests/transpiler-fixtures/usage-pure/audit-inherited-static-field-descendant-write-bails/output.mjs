import _at from "@core-js/pure/actual/instance/at";
// a subclass write to the inherited static field (`Sub.data = ...`) mutates the same slot the base's
// static method reads via `this.data`, so narrowing to the base initialiser type is unsound - the
// `.at()` polyfill degrades to the generic instance variant.
class Base {
  static data = [1, 2, 3];
  static read() {
    var _ref;
    return _at(_ref = this.data).call(_ref, 0);
  }
}
class Sub extends Base {}
Sub.data = "hello";