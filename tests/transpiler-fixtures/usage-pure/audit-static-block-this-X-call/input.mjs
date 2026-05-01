// `static { this.X(); }` resolves as `super.X` because `this` in static ctx is the
// constructor itself (extends Y). instance-fallback bails - `_at(this)` on a constructor
// is wrong. specific to isInheritedStaticLookup + handleStaticThis pathway.
class C extends Map {
  static {
    this.entries();
  }
}
