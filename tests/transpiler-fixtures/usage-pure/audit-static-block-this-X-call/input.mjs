// Inside a `static { ... }` block, `this.X()` calls the constructor's static `X` (inherited from `extends`).
// Instance-method dispatch would be wrong here; only the inherited-static path applies.
class C extends Map {
  static {
    this.entries();
  }
}
