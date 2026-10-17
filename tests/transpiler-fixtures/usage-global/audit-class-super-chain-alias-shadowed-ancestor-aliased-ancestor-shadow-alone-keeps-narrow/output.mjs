import "core-js/modules/es.array.includes";
class Bare {}
const BareAlias = Bare;
// same alias shape with no ancestor static: the narrow is correct and survives - array `includes` only
export function aliasedAncestorShadowAloneKeepsNarrow() {
  class Bare {}
  class Base extends BareAlias {}
  class Sub extends Base {
    static items = [1, 2, 3];
  }
  return Sub.items.includes("x");
}