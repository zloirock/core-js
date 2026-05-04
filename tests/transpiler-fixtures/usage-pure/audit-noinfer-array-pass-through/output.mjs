import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// NoInfer<T> is a transparent wrapper around T. Confirm the inner type passes
// through to receiver-type narrowing without losing precision.
type Wrap<T> = NoInfer<T[]>;
declare const arr: Wrap<string>;
_includesMaybeArray(arr).call(arr, 'x');
_atMaybeArray(arr).call(arr, 0);