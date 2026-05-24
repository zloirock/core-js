import _at from "@core-js/pure/actual/instance/at";
// TSSatisfiesExpression peer of the TSAsExpression case: `(new C() satisfies unknown).items
// = "string"` is also a runtime-transparent wrapper. unwrapRuntimeExpr peels both via
// shared TS_EXPR_WRAPPERS set, so the receiver still resolves to NewExpression and the
// write folds into C's instance-field flow union, widening the narrow on getFirst
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
(new C() satisfies unknown).items = "string";
new C().getFirst();