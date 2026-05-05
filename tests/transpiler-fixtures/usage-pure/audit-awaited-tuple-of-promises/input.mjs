// Awaited<[Promise<X>, Promise<Y>]> distributes element-wise per TS spec
// `Awaited<[A, B, C]>` = `[Awaited<A>, Awaited<B>, Awaited<C>]`. resolveAwaitedAnnotation
// has TSTupleType case that maps recurse over elements + folds inners through
// resolveTupleInner; peelAwaitedArgument has the parallel AST-rebuild for member-access
// flow. Both branches resolve to Array (different inner: number vs string), commonType
// keeps Array, drops inner -> p indexed access yields Array element type, item.at(0)
// narrows to _atMaybeArray. Distinct methods per line so each trace is unambiguous
async function tupleAwait() {
  type Pair = Awaited<[Promise<number[]>, Promise<string[]>]>;
  declare const p: Pair;
  const item = p[0];
  item.at(0);
  item.findLast(x => true);
}
tupleAwait();
