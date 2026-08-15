import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// a user declaration and a type parameter both outrank the built-in reading of the same
// name: neither is the global utility, and answering with the utility's verdict hands the
// wrong family to a value the source declares as an array
type Record<K, V> = V[];
declare const shadowedAlias: Record<string, number>;
declare function pick<Awaited extends number[]>(x: Awaited): Awaited;
declare const arr: number[];
export const first = _atMaybeArray(shadowedAlias).call(shadowedAlias, 0);
export const found = _includesMaybeArray(_ref = pick(arr)).call(_ref, 1);