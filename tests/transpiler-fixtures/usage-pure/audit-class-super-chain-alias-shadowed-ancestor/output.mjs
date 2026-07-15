import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// the ancestor reached through a const alias: the alias chain climbs to the scope its own root is
// declared in, so the canonical name it yields is only meaningful together with THAT scope. resolved
// back in the scope the walk started from, an inner class of the root's name answers instead
class Foo {
  static make() {
    this.items = "poison";
    return 1;
  }
}
class Bare {}
const FooAlias = Foo;
const BareAlias = Bare;

// alias hop crosses OUT of the shadowed region, so the held super-static must still be found and the
// narrow must widen - BOTH `at` legs
export function aliasedAncestorHeldSuperStaticDropsNarrow() {
  var _ref;
  class Foo {}
  class Base extends FooAlias {}
  class Sub extends Base {
    static items = [1, 2, 3];
    static grab() {
      return super.make;
    }
  }
  return _at(_ref = Sub.items).call(_ref, 0);
}

// same alias shape with no ancestor static: the narrow is correct and survives - array `includes` only
export function aliasedAncestorShadowAloneKeepsNarrow() {
  var _ref2;
  class Bare {}
  class Base extends BareAlias {}
  class Sub extends Base {
    static items = [1, 2, 3];
  }
  return _includesMaybeArray(_ref2 = Sub.items).call(_ref2, "x");
}