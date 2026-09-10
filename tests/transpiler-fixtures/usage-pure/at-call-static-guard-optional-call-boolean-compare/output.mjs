import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// the stamp's other reader: a guard compared to `false` is three-valued when its call may not have run
// - `undefined !== false` reads as a genuine answer on either side - and carries nothing in either
// direction. a `?.` over a static no build can be without is not that guard, so the comparison flips
// it and the code past the early return narrows to the array. the optional predicate beside it is the
// shape the refusal exists for
declare const obj: {
  isArr?(x: unknown): x is number[];
};
export function builtInCompare(value: number[] | string) {
  if (Array.isArray?.(value) === false) return null;
  return _atMaybeArray(value).call(value, 0);
}
export function predicateCompare(value: number[] | string) {
  if (obj.isArr?.(value) === false) return null;
  return _includes(value).call(value, 1);
}