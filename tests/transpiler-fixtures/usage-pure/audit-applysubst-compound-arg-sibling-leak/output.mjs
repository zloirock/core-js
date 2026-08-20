import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// chained generic alias where the outer substitution's compound arg references the INNER
// alias's own type-param: `type Outer<T> = Inner<T[]>; type Inner<U> = U[]` at `Outer<number>`
// maps {T: number, U: T[]}. a cycle guard on param names must prevent `U` re-substituting
// through the outer loop, so `r` resolves to `number[][]`. distinct methods lock the Array hint
type Inner<U> = U[];
type Outer<T> = Inner<T[]>;
declare const r: Outer<number>;
_atMaybeArray(r).call(r, 0);
_includesMaybeArray(r).call(r, []);