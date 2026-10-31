import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
class Bare {}
const BareAlias = Bare;
// same alias shape with no ancestor static: the narrow is correct and survives - array `includes` only
export function aliasedAncestorShadowAloneKeepsNarrow() {
  var _ref;
  class Bare {}
  class Base extends BareAlias {}
  class Sub extends Base {
    static items = [1, 2, 3];
  }
  return _includesMaybeArray(_ref = Sub.items).call(_ref, "x");
}