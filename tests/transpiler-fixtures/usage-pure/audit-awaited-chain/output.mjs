import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// Awaited<T> with nested Promise alias. plugin calls `unwrapPromise` which only
// works on $Object('Promise', inner). With explicit TS Awaited<Promise<Promise<string[]>>>
// expect deep unwrap to string[].
type Deep = Awaited<Promise<Promise<string[]>>>;
declare const d: Deep;
_atMaybeArray(d).call(d, 0);
_includesMaybeArray(d).call(d, 'x');