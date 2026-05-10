import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// nested Awaited around nested Promise; final inner type drives member narrowing
type T = Awaited<Awaited<Promise<Promise<number[]>>>>;
declare const x: T;
_includesMaybeArray(x).call(x, 1);
_atMaybeArray(x).call(x, 0);