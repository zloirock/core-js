// Stage-3 auto-accessor declared as a static with the same name as an inherited method.
// `class C extends Array { static accessor from = [...] }` - C now has its own static `from`
// accessor that returns an array. `this.from(0)` inside a static method calls the accessor,
// not Array.from, so polyfill must bail. own-member detection includes accessor properties
// alongside regular methods and fields
class C extends Array {
  static accessor from = [1, 2, 3];
  static run() {
    return this.from(0);
  }
}
