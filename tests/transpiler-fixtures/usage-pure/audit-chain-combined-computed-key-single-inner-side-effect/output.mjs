import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// computed-key outer WITH a side effect on a single-optional inner: the receiver is bound
// (`_ref.call(a)`) AND the effect folds into the combine's alternate (fires only on the
// non-short-circuit path). exercises receiver-preservation and SE-folding together in one combine
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