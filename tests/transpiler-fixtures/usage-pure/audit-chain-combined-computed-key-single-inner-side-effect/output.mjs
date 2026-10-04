import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// A computed-key effect follows an optional instance call on its non-short-circuit path.
// The call uses the receiver selected before method lookup; the effect follows the call result.
null == (_ref = _flatMaybeArray(a)) ? void 0 : (_ref2 = _ref.call(a), eff(), _includes(_ref2).call(_ref2, 2));
// super chain-start: the method-get memoizes `super.list`, the call threads `this`, and the
// outer key effect still follows the receiver memo
class A extends B {
  go() {
    var _ref3, _ref4;
    return null == (_ref3 = super.list) ? void 0 : (_ref4 = _ref3.call(this), eff(), _at(_ref4).call(_ref4, 0));
  }
}
new A();