import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
class Bare {}
const ExprPlain = class extends Bare {};
// same shape with no ancestor static to extract: nothing rebinds `this`, so the narrow is correct
export function classExpressionAncestorShadowAloneKeepsNarrow() {
  var _ref;
  class Bare {}
  class Sub extends ExprPlain {
    static items = [1, 2, 3];
  }
  return _includesMaybeArray(_ref = Sub.items).call(_ref, "x");
}