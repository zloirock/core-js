// Stage-3 auto-accessor declared static with the same name as a super-class static
// method. `class C extends Array { static accessor from = ... }` - C has its own `from`
// accessor. Then `this.from(x)` in a static method should bail (shadowed by own member)
// even though the accessor returns an iterable. `isShadowedByClassOwnMember` scans own
// names including accessor properties via `isClassAccessorProperty`.
class C extends Array {
  static accessor from = [1, 2, 3];
  static run() {
    return this.from(0);
  }
}
