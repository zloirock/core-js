import _at from "@core-js/pure/actual/instance/at";
// Every hop of a super chain resolves its own `extends` name in the scope THAT ancestor is declared in.
class Foo {
  static make() {
    this.items = "poison";
    return 1;
  }
}
class Base extends Foo {}
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