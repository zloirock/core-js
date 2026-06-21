import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `let A = Base; A = Other; class Sub extends A` - `A`'s runtime value at the extends-eval
// point is unknown (could be Base or Other). The extends-name resolution must check the
// binding's constantViolations and bail to null rather than treating `A` as an alias of Base.
// without the bail, Sub registers under Base, its write through `s.items` widens Base's
// field-flow tracker, and Base.items.at narrows to generic instead of staying array-specific.
class Base {
  items = [1, 2, 3];
}
class Other {
  items = "other";
}
let A = Base;
A = Other;
class Sub extends A {}
function probe() {
  var _ref;
  const s = new Sub();
  s.items = "fromSub";
  const b = new Base();
  return _atMaybeArray(_ref = b.items).call(_ref, 0);
}
probe();