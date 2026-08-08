// `take(Sub)` leaks the subclass binding to a user function, so an external `const D = Sub;
// new D().items = X` write can't be ruled out. C's inherited instance field can't be soundly
// narrowed, so getFirst() bails to generic `_at` (a safe widening) rather than the array-specific
// Maybe its number[] initializer alone would otherwise suggest
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
class Sub extends C {}
function take(x) { return x; }
take(Sub);
new C().getFirst();
