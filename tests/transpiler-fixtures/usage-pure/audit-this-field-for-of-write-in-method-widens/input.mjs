// `for (this.items of [...])` inside a method rebinds the instance field `items` to each iteration
// value - an internal `this`-write that never appears as an assignment LHS. Folding the for-of
// head's member target into the field flow widens `items`, so `.at` gets the generic polyfill.
class C {
  items = [1, 2, 3];
  load() { for (this.items of ["a", "b"]) {} }
  getFirst() { return this.items.at(0); }
}
new C().getFirst();
