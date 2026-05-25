// TSSatisfiesExpression peer of the TSAsExpression case: `(new C() satisfies unknown).items
// = "string"` is also a runtime-transparent wrapper. paren / TS peel strips both via
// the shared TS-expr wrapper set, so the receiver still resolves to NewExpression and the
// write folds into C's instance-field flow union, widening the narrow on getFirst
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
(new C() satisfies unknown).items = "string";
new C().getFirst();
