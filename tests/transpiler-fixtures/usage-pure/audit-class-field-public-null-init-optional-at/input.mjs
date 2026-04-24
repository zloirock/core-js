// public class field `box` initialized to `null` and later assigned `Array.from(xs)`.
// plugin widens the field's type to Array (same as for private `#box` fields) so
// `this.box?.at(0)` picks the array-specific polyfill variant
class Maybe {
  box = null;
  set(xs) { this.box = Array.from(xs); }
  firstOrNull() { return this.box?.at(0) ?? null; }
}
