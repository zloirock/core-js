import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _at from "@core-js/pure/actual/instance/at";
import _Object$entries from "@core-js/pure/actual/object/entries";
var _ref3;
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
export const viaConcat = _at(_ref3 = _Array$of(1, 2)).call(_ref3, 0);
export const viaTemplate = _Object$entries({
  a: 1
});
Array.isArray = function (x) {
  return !!x;
};
const mutatedKey = 'is' + 'Array';
export const viaMutated = Array[mutatedKey]?.([1]);
export const r = C.viaAlias();