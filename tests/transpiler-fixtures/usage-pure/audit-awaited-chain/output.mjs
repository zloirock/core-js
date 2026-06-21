import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Awaited<T> over a nested Promise alias: explicit `Awaited<Promise<Promise<string[]>>>`
// must deep-unwrap each Promise layer down to string[], so `at` / `includes` emit the
// array-specific helpers.
type Deep = Awaited<Promise<Promise<string[]>>>;
declare const d: Deep;
_atMaybeArray(d).call(d, 0);
_includesMaybeArray(d).call(d, 'x');