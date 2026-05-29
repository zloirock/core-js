// No subclass overrides the instance method, so the `this.makeItems()` return stays narrowed
// to the array element variant (precision boundary for the subclass-shadow bail).
class Base {
  makeItems(): number[] { return []; }
  first() { return this.makeItems().at(-1); }
}
new Base().first();
