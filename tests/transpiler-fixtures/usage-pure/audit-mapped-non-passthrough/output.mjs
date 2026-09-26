import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// mapped type with `as` key remap (`_${K}`): expansion enumerates source keys, evaluates
// the rename template per key, and substitutes K in the body so `r._foo` resolves through
// to the source `foo`'s type (`string[]`) and `.at(0)` narrows to the array polyfill
type Renamed<T> = { [K in keyof T as `_${string & K}`]: T[K] };
declare const r: Renamed<{
  foo: string[];
}>;
_atMaybeArray(_ref = r._foo).call(_ref, 0);