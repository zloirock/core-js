import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// which member answers a read of a class property. a field is installed by define AFTER the body's
// methods and accessors exist, so it wins whatever the source order, and an INSTANCE field is an own
// property of the one instance, so it also shadows an accessor declared further along the prototype
// chain. reading that off the output needs a method carrying BOTH an array and a string variant -
// only `at` and `includes` do, and a single-family method would emit its array helper for an
// unresolved receiver too, proving nothing. so those two repeat here by necessity; each row stays
// attributable through its own rewritten call
class SameBody {
  a = [1];
  get a() {
    return "s";
  }
}
_includesMaybeArray(_ref = new SameBody().a).call(_ref, 1);
class Base {
  b = [1];
}
class Derived extends Base {
  get b() {
    return "s";
  }
}
_atMaybeArray(_ref2 = new Derived().b).call(_ref2, 0);