import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _Object$entries from "@core-js/pure/actual/object/entries";
var _ref3, _ref4, _ref5, _ref6, _ref7;
// computed keys folding through the canonical resolver - a const alias, a literal concat, a
// single-quasi template - classify the optional callee the same as the dotted form: the
// resolved static is always defined post-rewrite, so the `?.` deopts and the injected binding
// takes the call; a fold that reaches a MUTATED static keeps its guard (the patch owns the slot)
const aliasKey = 'from';
class C extends Array {
  static viaAlias() {
    var _ref, _ref2;
    return _at(_ref = _flatMaybeArray(_ref2 = _Array$from.call(this, [1, 2])).call(_ref2)).call(_ref, 0);
  }
}
export const viaConcat = _atMaybeArray(_ref3 = _Array$of(1, 2)).call(_ref3, 0);
export const viaTemplate = _Object$entries({
  a: 1
});
// ... and the EFFECT-bearing spellings of the same fold, nested to a depth the one-layer peel this
// channel used to spell by hand could not reach: the key names the same static, so the split
// respells it exactly as its single-layer twin, and the prefix runs where the source wrote it
let k = 0;
export const viaSeqKey = _atMaybeArray(_ref4 = (k++, _Array$of)(3)).call(_ref4, 0);
export const viaNestedSeqKey = _atMaybeArray(_ref5 = (k++, k++, _Array$of)(4)).call(_ref5, 0);
export const viaSeqConcatKey = _atMaybeArray(_ref6 = (k++, _Array$of)(5)).call(_ref6, 0);
export const viaSeqTemplateKey = _atMaybeArray(_ref7 = (k++, _Array$of)(6)).call(_ref7, 0);
export const keyEffects = k;
Array.isArray = function (x) {
  return !!x;
};
const mutatedKey = 'is' + 'Array';
export const viaMutated = Array[mutatedKey]?.([1]);
export const r = C.viaAlias();