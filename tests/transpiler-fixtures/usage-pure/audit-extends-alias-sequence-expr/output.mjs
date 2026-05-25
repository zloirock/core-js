import _at from "@core-js/pure/actual/instance/at";
// `const A = (side(), Base); class Sub extends A {}` - the alias init is a SequenceExpression
// whose tail IS the canonical Base. the extends-clause Identifier walker peels SE-prefix
// so Sub registers under Base. Sub's instance write through `s.items` widens Base's
// field-flow tracker and Base.items.at falls back to generic. without the peel, init.type
// sees SequenceExpression and Sub isn't linked to Base - Sub's write stays isolated and
// Base's narrow stays array-specific (wrong: the runtime IS reachable through Sub
// instances, so the value may not be Array)
function side() {
  return null;
}
class Base {
  items = [1, 2, 3];
}
const A = (side(), Base);
class Sub extends A {}
function probe() {
  var _ref;
  const s = new Sub();
  s.items = "fromSub";
  const b = new Base();
  return _at(_ref = b.items).call(_ref, 0);
}
probe();