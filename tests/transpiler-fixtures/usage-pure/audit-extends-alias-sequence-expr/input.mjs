// `const A = (side(), Base); class Sub extends A {}` - the alias init is a SequenceExpression
// whose tail IS the canonical Base. extendsClauseName's Identifier-walker peels SE-prefix
// (via unwrapExpressionChain) so Sub registers under Base. Sub's instance write through
// `s.items` widens Base's field-flow tracker and Base.items.at falls back to generic.
// without the peel, init.type sees SequenceExpression and Sub isn't linked to Base - Sub's
// write stays isolated and Base's narrow stays array-specific (wrong: the runtime IS
// reachable through Sub instances, so the value may not be Array)
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
