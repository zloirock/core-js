// TS-wrapped method call on a class instance: `(c as any).run()`. classifyClosureRef must
// recognize the wrapped call as 'call' rather than 'extraction' so the closure's temporal
// bound is set to the call's source position, and external writes AFTER the call drop out
// of the field-flow union. without TS-wrap peel between identifier and member context,
// the call wraps as TSAsExpression -> MemberExpression -> CallExpression, the immediate
// parent is TSAsExpression (not MemberExpression), classification falls through to
// 'extraction' with infinite temporal bound, and the late `c.items = "string"` write is
// folded in - widening narrow to generic _at
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
const c = new C();
(c as any).getFirst();
c.items = "string";
