import _at from "@core-js/pure/actual/instance/at";
// TS-wrapped unbound instance write: `(new C() as any).items = "string"`. the cast is a
// runtime no-op, so the write target IS a `new C()` instance and must fold into C's
// instance-field flow. without TS-wrap peel in isReceiverNewOfClass, the outer
// TSAsExpression masks the NewExpression and the external write is dropped from the
// field-flow union, narrowing `this.items.at(0)` to array-only - blowing up on String
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
(new C() as any).items = "string";
new C().getFirst();