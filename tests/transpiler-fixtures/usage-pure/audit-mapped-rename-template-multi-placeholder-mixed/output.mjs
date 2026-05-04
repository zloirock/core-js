import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// matchTemplatePattern multi-placeholder with mixed types: `${string}_${number}` requires
// some prefix string, then literal '_', then a number-shaped suffix. lazy-from-left
// segmentation finds the FIRST '_' so 'a_42' is split as ('a', '42'). 'a_b_42' splits as
// ('a', 'b_42') which fails number validation - precision-limited (TS would accept it
// because the string-placeholder allows underscores).
//   K = 'foo_42' - first '_' at index 3, segment '42' valid number -> match
//   K = 'a_b_42' - first '_' at index 1, segment 'b_42' invalid number -> drop
//   K = 'no_match' - segment 'match' invalid number -> drop
type Pick<T> = { [K in keyof T as K extends `${string}_${number}` ? K : never]: T[K] };
declare const r: Pick<{
  foo_42: number[];
  a_b_42: string[];
  no_match: boolean;
}>;
_atMaybeArray(_ref = r.foo_42).call(_ref, 0);
_includes(_ref2 = r.a_b_42).call(_ref2, 'x');