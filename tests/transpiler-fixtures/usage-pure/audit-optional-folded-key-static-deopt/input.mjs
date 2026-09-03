// computed keys folding through the canonical resolver - a const alias, a literal concat, a
// single-quasi template - classify the optional callee the same as the dotted form: the
// resolved static is always defined post-rewrite, so the `?.` deopts and the injected binding
// takes the call; a fold that reaches a MUTATED static keeps its guard (the patch owns the slot)
const aliasKey = 'from';
class C extends Array {
  static viaAlias() {
    return this[aliasKey]?.([1, 2]).flat().at(0);
  }
}
export const viaConcat = Array['o' + 'f']?.(1, 2).at(0);
export const viaTemplate = Object[`entries`]?.({ a: 1 });
// ... and the EFFECT-bearing spellings of the same fold, nested to a depth the one-layer peel this
// channel used to spell by hand could not reach: the key names the same static, so the split
// respells it exactly as its single-layer twin, and the prefix runs where the source wrote it
let k = 0;
export const viaSeqKey = Array[(k++, 'of')]?.(3).at(0);
export const viaNestedSeqKey = Array[(k++, (k++, 'of'))]?.(4).at(0);
export const viaSeqConcatKey = Array[(k++, 'o') + 'f']?.(5).at(0);
export const viaSeqTemplateKey = Array[`${ (k++, 'o') }f`]?.(6).at(0);
export const keyEffects = k;
Array.isArray = function (x) { return !!x; };
const mutatedKey = 'is' + 'Array';
export const viaMutated = Array[mutatedKey]?.([1]);
export const r = C.viaAlias();
