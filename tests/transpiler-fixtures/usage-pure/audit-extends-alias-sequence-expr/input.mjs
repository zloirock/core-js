// `const A = (side(), Base); class Sub extends A {}` - the alias init is a SequenceExpression
// whose tail IS the canonical Base. the extends-name resolution must peel the SE prefix so Sub
// registers under Base; then Sub's write through `s.items` widens Base's field-flow tracker and
// Base.items.at falls back to generic (correct: the runtime IS reachable through Sub instances).
// without the peel Sub isn't linked to Base, its write stays isolated, and Base narrows array-specific.
function side() { return null; }
class Base {
  items = [1, 2, 3];
}
const A = (side(), Base);
class Sub extends A {}
function probe() {
  const s = new Sub();
  s.items = "fromSub";
  const b = new Base();
  return b.items.at(0);
}
probe();
