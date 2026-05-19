import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `var A = B; var B = A; class Sub extends A {}` - mutual aliases form a cycle with no
// canonical class anchor. extendsClauseName's seen-set walker must return null on cycle
// exit rather than the last-visited name. without the null return, Sub registers under
// the cycle's last name, polluting any class registered under that name with off-class
// subclass writes. with the null return, Sub stays unregistered and the unrelated `Base`
// (not in the alias cycle) keeps narrow on its own static field
class Base {
  static items = [1, 2, 3];
  static getFirst() {
    var _ref;
    return _atMaybeArray(_ref = Base.items).call(_ref, 0);
  }
}
var A = B;
var B = A;
class Sub extends A {}
Sub.unrelatedStatic = "fromSub";
Base.getFirst();