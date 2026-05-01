import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// classic getter-pattern: `as `get${Capitalize<string & K>}`` produces `getFoo`-style keys.
// nested template walks: outer template -> inner Capitalize<string & K> -> string-keyword
// drop -> K substitution. validates compositional evaluation through INTRINSIC_STRING_TRANSFORMERS
type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: T[K] };
declare const r: Getters<{
  items: number[];
}>;
_atMaybeArray(_ref = r.getItems).call(_ref, 0);