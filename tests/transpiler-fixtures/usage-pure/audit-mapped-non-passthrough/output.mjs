import _at from "@core-js/pure/actual/instance/at";
var _ref;
// a mapped type with a key remap (`as ...`) hides the original property,
// so the receiver's type cannot be resolved and `.at(0)` falls back to
// the generic instance-method polyfill instead of an array-specific one.
type Renamed<T> = { [K in keyof T as `_${string & K}`]: T[K] };
declare const r: Renamed<{
  foo: string[];
}>;
_at(_ref = r._foo).call(_ref, 0);