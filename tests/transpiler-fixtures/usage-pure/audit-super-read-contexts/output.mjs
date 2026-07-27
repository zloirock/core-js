import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref3;
// the prototype-routed read rule has to hold wherever the `super` sits, not just in a plain method:
// an arrow keeps the enclosing super binding, a static block reads the parent CONSTRUCTOR (so a
// static field is visible there), an instance field initializer reads the parent prototype like any
// method, and the walk has to cross an intermediate class to reach the declaring one. the rows use
// only `at` and `includes` because they are the two methods carrying both an array and a string
// variant - the emitted helper is the whole signal here. nothing is exported: an escaping class
// switches the field narrow off entirely, which would make the static rows vacuous
class Base {
  get a() {
    return "s";
  }
}
class InArrow extends Base {
  a = [1];
  m() {
    return (() => {
      var _ref;
      return _includesMaybeString(_ref = super.a).call(_ref, "s");
    })();
  }
}
class StaticBase {
  static b = [1];
}
class InStaticBlock extends StaticBase {
  static {
    var _ref2;
    _atMaybeArray(_ref2 = super.b).call(_ref2, 0);
  }
}
class InFieldInit extends Base {
  c = _atMaybeString(_ref3 = super.a).call(_ref3, 0);
}
class Middle extends StaticBase {}
class TwoLevels extends Middle {
  static m() {
    var _ref4;
    return _includesMaybeArray(_ref4 = super.b).call(_ref4, 1);
  }
}