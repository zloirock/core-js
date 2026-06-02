import _at from "@core-js/pure/actual/instance/at";
// `for (c.items of [...])` rebinds `c.items` to each iteration value - an external field write
// that never appears as an assignment LHS. Folding the for-of head's member target into the field
// flow widens `items` away from its array initializer, so `.at` gets the generic polyfill.
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
const c = new C();
for (c.items of ["a", "b"]) {}
c.getFirst();