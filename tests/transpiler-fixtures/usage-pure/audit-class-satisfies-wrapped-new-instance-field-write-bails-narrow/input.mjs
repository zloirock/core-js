// TSSatisfiesExpression peer of the TSAsExpression case: `(new C() satisfies unknown).items
// = "string"` is also a runtime-transparent wrapper. unwrapRuntimeExpr peels both via
// shared TS_EXPR_WRAPPERS set, so the receiver still resolves to NewExpression and the
// write folds into C's instance-field flow union, widening the narrow on getFirst
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
(new C() satisfies unknown).items = "string";
new C().getFirst();
