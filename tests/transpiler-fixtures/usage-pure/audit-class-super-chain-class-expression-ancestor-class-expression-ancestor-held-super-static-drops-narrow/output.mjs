import _at from "@core-js/pure/actual/instance/at";
// an ancestor held by a declarator whose init is a class EXPRESSION is the other shape a hop can land
// on, and it carries its declarator's scope the same way a declaration carries its own: the next hop's
// `extends` name must read there. both rows sit under the same shadow, so what decides is the held
// super-static - one method each, so the import set says which row answered what
class Foo {
  static make() {
    this.items = "poison";
    return 1;
  }
}
const ExprBase = class extends Foo {};
// the hop lands on the class expression, and from ITS declarator's scope the poisoning ancestor is
// still reachable - the held `super.make` rebinds `this` later, so the narrow must widen
export function classExpressionAncestorHeldSuperStaticDropsNarrow() {
  var _ref;
  class Foo {}
  class Sub extends ExprBase {
    static items = [1, 2, 3];
    static grab() {
      return super.make;
    }
  }
  return _at(_ref = Sub.items).call(_ref, 0);
}