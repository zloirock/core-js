import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// a TS template literal type with NO expressions (just one quasi like `` `abc` ``) is
// equivalent to the string literal `'abc'`, not a prefix. only an exact-match member
// should pass the rename filter; partial matches like `abcdef` must NOT sneak through
type Filter<T> = { [K in keyof T as K extends `abc` ? K : never]: T[K] };
declare const r: Filter<{ abc: number[]; abcdef: string[] }>;
_atMaybeArray(_ref = r.abc).call(_ref, 0);
_includes(_ref2 = r.abcdef).call(_ref2, 'a');