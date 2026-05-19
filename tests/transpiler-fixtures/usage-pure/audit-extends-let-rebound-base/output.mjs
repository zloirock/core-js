import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `let A = Base; A = Other; class Sub extends A` - `A`'s runtime value at the extends-eval
// point is unknown (could be Base or Other). extendsClauseName must check binding.constantViolations
// and bail to null rather than treating `A` as a canonical alias of Base. without the bail,
// Sub registers under Base, Sub's instance write through `s.items` erroneously widens Base's
// field-flow tracker, and Base.items.at narrows to generic. with the bail, Sub doesn't link
// to Base and the Sub-side write stays isolated - Base's narrow remains array-specific
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