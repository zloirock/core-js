// TS-wrapped method call on a class instance: `(c as any).getFirst()`. the closure walk must
// classify the wrapped call as a CALL, not an extraction, so its temporal bound is the call's
// position and writes AFTER it drop from the field-flow union. without peeling the TS wrap, the
// immediate parent is TSAsExpression not MemberExpression, the late `c.items =` folds in - unsound narrow
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
const c = new C();
(c as any).getFirst();
c.items = "string";
