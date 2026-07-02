import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// Three-hop generic alias chain wrapping `Promise<X[] | string[]>` - both union branches are
// Array (different inners) so the union folds to Array. the awaited resolve must merge type-arg
// substitution across THREE alias hops, then peel the Promise and distribute the union. companion
// to the disjoint-union audit-awaited-deep-alias-chain-promise: 3-hop merge must not break the fold
type Inner<X> = Promise<X[] | string[]>;
type Mid<X> = Inner<X>;
type Outer<X> = Mid<X>;
async function probe(): Promise<Outer<number>> {
  return _Promise$resolve([1, 2, 3]);
}
const result = await probe();
_atMaybeArray(result).call(result, 0);
_findLastMaybeArray(result).call(result, x => true);