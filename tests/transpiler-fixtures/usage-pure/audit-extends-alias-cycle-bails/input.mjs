// `var A = B; var B = A; class Sub extends A {}` - mutual aliases form a cycle with no
// canonical class anchor. The extends-name walk must return null on cycle exit rather than
// the last-visited name. without the null return, Sub registers under the cycle's last name,
// polluting any class registered there with off-class subclass writes. with it, Sub stays
// unregistered and the unrelated `Base` keeps narrow on its own static field.
class Base {
  static items = [1, 2, 3];
  static getFirst() { return Base.items.at(0); }
}
var A = B;
var B = A;
class Sub extends A {}
Sub.unrelatedStatic = "fromSub";
Base.getFirst();
