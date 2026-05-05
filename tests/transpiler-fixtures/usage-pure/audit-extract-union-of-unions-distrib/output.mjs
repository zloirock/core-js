import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Extract<U, T> distributes over a union-of-unions via type-alias hops:
// type A = number[] | string[]; type B = boolean[] | A; -> Extract<B, number[]|string[]>
// expands union members across alias chain. resolveExtractExclude unwraps `first`
// once via followTypeAliasChain - inner alias `A` should expand to its constituents
// when iterated in the union loop. Probe whether nested-alias union members are
// flattened by alias-chain follow at the union member resolution.
type Inner = number[] | string[];
type Outer = boolean[] | Inner;
type Filtered = Extract<Outer, number[] | string[]>;
declare const v: Filtered;
_atMaybeArray(v).call(v, 0);
_findLastMaybeArray(v).call(v, x => true);