// a subclass write to the inherited static field (`Sub.data = ...`) mutates the same slot the base's
// static method reads via `this.data`, so narrowing to the base initialiser type is unsound - the
// `.at()` polyfill degrades to the generic instance variant.
class Base {
  static data = [1, 2, 3];
  static read() { return this.data.at(0); }
}
class Sub extends Base {}
Sub.data = "hello";
