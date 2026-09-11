import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// Template `foo${string}` must still match `foo`-prefixed keys after the no-placeholder fix.
// Per-key narrowing routes Array vs String value types to their respective polyfill variants.
type Filter<T> = { [K in keyof T as K extends `foo${string}` ? K : never]: T[K] };
declare const r: Filter<{
  fooArr: number[];
  fooStr: string;
  bar: boolean;
}>;
_atMaybeArray(_ref = r.fooArr).call(_ref, 0);
_includesMaybeString(_ref2 = r.fooStr).call(_ref2, 'a');