// auto-accessor class field (TC39 decorators) initialized to `null` and later
// assigned `new Set(xs)`. plugin widens the field's type to include Set, so
// `this.box?.entries()` picks the Set-aware polyfill for `.entries`
class C {
  accessor box = null;
  load(xs) { this.box = new Set(xs); }
  snapshot() { return this.box?.entries(); }
}
