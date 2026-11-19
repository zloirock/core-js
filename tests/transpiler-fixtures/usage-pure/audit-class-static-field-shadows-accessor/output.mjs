import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2;
// the static half of the same rule, and its boundary. a static field is defined on the constructor
// after the body's static accessors, so within one body the field still wins. across a chain the
// rule inverts: a static read walks the CONSTRUCTOR chain, where an own accessor on the subclass
// shadows the field it inherits - the second row must keep resolving to the accessor's string.
// only `at` and `includes` carry both variants, so the emitted helper is what tells the two apart
class SameBody {
  static a = [1];
  static get a() {
    return "s";
  }
}
_includesMaybeArray(_ref = SameBody.a).call(_ref, 1);
class StaticBase {
  static b = [1];
}
class StaticDerived extends StaticBase {
  static get b() {
    return "s";
  }
}
_atMaybeString(_ref2 = StaticDerived.b).call(_ref2, 0);