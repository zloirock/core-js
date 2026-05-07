// shape-preservation lock: name collision between value-binding `T` and
// interface type-param `T`. interface member substitution applies applyAliasSubstDeep
// over `val`'s typeAnnotation `typeof T`. before the fix, the TSTypeQuery branch hit
// subst.has(exprName) and returned subst.get(name) - a TSStringKeyword where downstream
// expected TSTypeQuery payload, scrambling member resolution (val resolved as string,
// not as the value-binding T's array type). after the fix, exprName substitution is
// skipped (value-space ref vs type-space subst keys are different namespaces), so
// `typeof T` correctly resolves to the value-binding T (the runtime array)
const T = [1, 2, 3];
interface Box<T> {
  val: typeof T;
}
declare const b: Box<string>;
const head = b.val.at(0);
const idx = b.val.findLastIndex(x => x > 0);
export { head, idx };
