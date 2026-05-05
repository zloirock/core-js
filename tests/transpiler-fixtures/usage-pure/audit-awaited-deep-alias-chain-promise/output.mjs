import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Awaited<DeepOuter<number[]>> through 3-hop alias chain. Annotation path peels
// Promise<number[] | string> via followTypeAliasChain ({X -> number[]} subst), distributes
// the union, but foldUnionTypes returns null on the disjoint Array vs primitive branches.
// resolveAwaitExpressionType then falls through to body-inference: probe's body returns
// `Promise.resolve([1,2,3])` which (with Promise.resolve arg inference) resolves to
// Promise<Array<number>>; unwrapPromise peels to Array<number>, so result.includes('foo')
// narrows precisely to Array's includes polyfill instead of widening to generic dispatch.
// Body-inference fallback fires only when annotation path returns null (lost precision);
// foldable-union variant in audit-awaited-three-hop-foldable-union doesn't need fallback
type DeepInner<X> = Promise<X | string>;
type DeepMid<X> = DeepInner<X>;
type DeepOuter<X> = DeepMid<X>;
async function probe(): Promise<DeepOuter<number[]>> {
  return _Promise$resolve([1, 2, 3]);
}
const result = await probe();
_includesMaybeArray(result).call(result, 'foo');