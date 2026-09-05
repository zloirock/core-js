import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
// Interaction of the super-optional chain-combine with a trailing operator: the combine emits ONE
// guard for `super.flat?.().map().at(-1)` (super method-GET memoized, `_ref.call(this)`), and the
// trailing `** 2` operator must wrap the WHOLE guarded ternary, not bind to the success branch only.
// exercises the combine's chain-emit paren-wrap reaching the chain tip on a super chainStart
class Wrapped extends Array {
  tail() {
    var _ref, _ref2, _ref3;
    return (null == (_ref = super.flat) ? void 0 : _at(_ref2 = _mapMaybeArray(_ref3 = _ref.call(this)).call(_ref3, x => x)).call(_ref2, -1)) ** 2;
  }
}