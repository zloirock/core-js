import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Three-hop generic alias chain wrapping `Promise<X[] | string[]>` - both union branches
// are Array (different inner types) so foldUnionTypes drops the inner but keeps Array
// constructor. resolveAwaitedAnnotation must distribute through followTypeAliasChain's
// accumulated subst across THREE hops then peel the Promise + distribute the union and
// fold to $Object('Array'). Probes that 3-hop subst merging doesn't break foldable-union
// narrowing (companion to disjoint-union case in audit-awaited-deep-alias-chain-promise)
type Inner<X> = Promise<X[] | string[]>;
type Mid<X> = Inner<X>;
type Outer<X> = Mid<X>;
async function probe(): Promise<Outer<number>> {
  return _Promise$resolve([1, 2, 3]);
}
const result = await probe();
_atMaybeArray(result).call(result, 0);
_findLastMaybeArray(result).call(result, x => true);