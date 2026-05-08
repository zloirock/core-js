import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// Template `${string}_${number}` is segmented lazy-from-left, so multi-underscore keys hit a precision edge.
// `foo_42` matches and narrows; `a_b_42` segments as `(a, b_42)` and fails number validation, so it drops.
type Pick<T> = { [K in keyof T as K extends `${string}_${number}` ? K : never]: T[K] };
declare const r: Pick<{
  foo_42: number[];
  a_b_42: string[];
  no_match: boolean;
}>;
_atMaybeArray(_ref = r.foo_42).call(_ref, 0);
_includes(_ref2 = r.a_b_42).call(_ref2, 'x');