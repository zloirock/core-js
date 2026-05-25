// `const c = (new C())` - paren-wrapped new-expression with parser preserving the
// ParenthesizedExpression node (oxc behaviour; babel strips by default). previously
// buildProgramIndex's NewExpression visitor classified parent context off raw
// `p.parent` - the wrapper showed up as parent, so isDeclaratorInit collapsed to
// false, isLeakPosition flipped to true, and collectClassInstanceClosure bailed.
// the field-flow narrow at `this.items.at(0)` then dropped to generic `_at`. with
// the wrapperPath peel through ParenthesizedExpression / TS expression wrappers the
// effective declarator parent is reached and narrow lands as `_atMaybeArray`
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
const c = (new C());
c.getFirst();
