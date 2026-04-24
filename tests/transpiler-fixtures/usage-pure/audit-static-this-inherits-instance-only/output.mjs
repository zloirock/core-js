// `this.at(0)` in a static method of a class that extends Array. Array has `.at` as an
// INSTANCE method, not a static one - static lookup up the proto chain finds nothing.
// plugin must NOT rewrite to `_Array.at(0)` (undefined at runtime) and must NOT rewrite
// to `_at(this).call(this, 0)` (`this` is the constructor here, not an array instance)
class C extends Array {
  static foo() {
    return this.at(0);
  }
}