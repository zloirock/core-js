import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2;
// computed-key SequenceExpression on an optional polyfilled inner call: the key side effect must
// run exactly ONCE. the combine folds it into the single memo slot `_ref = (eff(), _flatMaybeArray(
// arr))`, then the trailing `.map` reuses `_ref.call(arr)` (binding `this`). both plugins agree -
// the computed-key inner resolves through the combined-chain path with the key SE folded in front
declare const arr: {
  flat?: () => number[];
};
declare const eff: () => 'flat';
null == (_ref = (eff(), _flatMaybeArray(arr))) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(arr)).call(_ref2, (x: number) => x);