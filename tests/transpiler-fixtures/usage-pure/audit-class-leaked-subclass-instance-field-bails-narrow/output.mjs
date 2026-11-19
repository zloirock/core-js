import _at from "@core-js/pure/actual/instance/at";
// `take(Sub)` leaks the subclass binding to a user function, so an external `const D = Sub;
// new D().items = X` write can't be ruled out. C's inherited instance field can't be soundly
// narrowed, so getFirst() bails to generic `_at` (a safe widening) rather than the array-specific
// Maybe its number[] initializer alone would otherwise suggest
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
class Sub extends C {}
function take(x) {
  return x;
}
take(Sub);
new C().getFirst();