import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `const c = (new C())` - paren-wrapped NewExpression where oxc keeps the ParenthesizedExpression
// node (babel strips it). classifying the parent off the raw wrapper makes it look like a leak
// position, not a declarator init, so the instance closure bails and `this.items.at(0)` drops to
// generic `_at`. peeling the Paren / TS wrappers reaches the declarator and narrows to `_atMaybeArray`
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
const c = new C();
c.getFirst();