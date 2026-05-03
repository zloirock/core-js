import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// regression lock for the no-placeholder guard: a TSTemplateLiteralType with a real
// `${string}` placeholder must still match keys that have the head as a prefix. without
// this lock the no-placeholder fix could have over-restricted the matcher and broken the
// placeholder-bearing template case. `at` and `includes` are defined on both Array and
// String, so per-key type-routing is visible: `r.fooArr.at(0)` resolves to
// `_atMaybeArray` (number[]), `r.fooStr.includes('a')` resolves to `_includesMaybeString`
// (string). bar (boolean, no `at`/`includes`) is filtered out of the rename and never
// reaches the polyfill emit
type Filter<T> = { [K in keyof T as K extends `foo${string}` ? K : never]: T[K] };
declare const r: Filter<{
  fooArr: number[];
  fooStr: string;
  bar: boolean;
}>;
_atMaybeArray(_ref = r.fooArr).call(_ref, 0);
_includesMaybeString(_ref2 = r.fooStr).call(_ref2, 'a');