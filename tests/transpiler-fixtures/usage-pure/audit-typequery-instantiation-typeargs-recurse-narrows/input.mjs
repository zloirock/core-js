// typeParameters-recurse lock: outer interface generic T threaded through
// inner TSTypeQuery's typeParameters via TS 4.7+ instantiation expression on `typeof
// makeBox<T>`. nested member access `c.box.items` reaches getTypeMembers' ReturnType
// branch which calls `buildCallSiteSubst(resolved.node, arg)` against `arg.typeParameters`.
// before the fix, applyAliasSubstDeep's TSTypeQuery branch never recursed typeParameters,
// so the inner T stayed raw; buildCallSiteSubst gave `U -> T_raw` and `items` resolved as
// `T_raw` (unbound type-param), which has no array shape so `.at(0)` fell back to generic.
// after the fix, withSubstitutedTypeArgs threads T -> number[] into typeParameters,
// `items` resolves to number[] via U substitution, and `.at(0)` narrows to MaybeArray
declare function makeBox<U>(): { items: U };
interface Container<T> {
  box: ReturnType<typeof makeBox<T>>;
}
declare const c: Container<number[]>;
const head = c.box.items.at(0);
const idx = c.box.items.findLastIndex(x => x > 0);
export { head, idx };
