class Bare {}
const ExprPlain = class extends Bare {};
// same shape with no ancestor static to extract: nothing rebinds `this`, so the narrow is correct
export function classExpressionAncestorShadowAloneKeepsNarrow() {
  class Bare {}
  class Sub extends ExprPlain {
    static items = [1, 2, 3];
  }
  return Sub.items.includes("x");
}
