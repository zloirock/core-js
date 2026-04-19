import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// multi-step alias `const B = A; const A = (Promise); class C extends B` - resolveSuperClassName
// walks B → A via Identifier init, then needs to peel `(Promise)` ParenthesizedExpression to
// reach the bare `Promise` identifier. oxc preserves parens; babel strips pre-visit
const A = _Promise;
const B = A;
class C extends B {
  static run(r) {
    return _Promise$try.call(this, r);
  }
}