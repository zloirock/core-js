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
Array.isArray = function (x) { return !!x; };
const mutatedKey = 'is' + 'Array';
export const viaMutated = Array[mutatedKey]?.([1]);
export const r = C.viaAlias();
