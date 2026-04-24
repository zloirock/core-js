import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// trivial mapped passthrough `{ [K in keyof T]: T[K] }` - type resolves through to T.
// expect Array-specific polyfill since T=string[]
type Copy<T> = { [K in keyof T]: T[K] };
declare const a: Copy<string[]>;
_atMaybeArray(a).call(a, 0);
_includesMaybeArray(a).call(a, 'foo');