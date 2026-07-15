import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// every hop of a super chain resolves its own `extends` name in the scope THAT ancestor is declared
// in. read against the subclass's scope instead, an inner class of the same name answers for the real
// ancestor, and the static set collected off the wrong class misses the `super` extraction that must
// drop the narrow. both rows sit under the SAME shadow, so what decides is the held super-static, not
// the shadow: one method each, so the import set says which row answered what
class Foo {
  static make() {
    this.items = "poison";
    return 1;
  }
}
class Base extends Foo {}
class Bare {}
class Plain extends Bare {}

// `super.make` is HELD, not called: invoking it later rebinds `this` and writes a string over
// `items`, so the array narrow is unsound and must widen - BOTH `at` legs
export function heldSuperStaticDropsNarrow() {
  var _ref;
  class Foo {}
  class Sub extends Base {
    static items = [1, 2, 3];
    static grab() {
      return super.make;
    }
  }
  return _at(_ref = Sub.items).call(_ref, 0);
}

// the same shadow, but no ancestor static exists to extract: nothing can rebind `this`, so the
// narrow is CORRECT and must survive - the array `includes` leg alone
export function shadowAloneKeepsNarrow() {
  var _ref2;
  class Bare {}
  class Sub extends Plain {
    static items = [1, 2, 3];
  }
  return _includesMaybeArray(_ref2 = Sub.items).call(_ref2, "x");
}