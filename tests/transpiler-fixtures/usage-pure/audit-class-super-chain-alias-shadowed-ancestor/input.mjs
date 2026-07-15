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
  class Foo {}
  class Base extends FooAlias {}
  class Sub extends Base {
    static items = [1, 2, 3];
    static grab() {
      return super.make;
    }
  }
  return Sub.items.at(0);
}

// same alias shape with no ancestor static: the narrow is correct and survives - array `includes` only
export function aliasedAncestorShadowAloneKeepsNarrow() {
  class Bare {}
  class Base extends BareAlias {}
  class Sub extends Base {
    static items = [1, 2, 3];
  }
  return Sub.items.includes("x");
}
