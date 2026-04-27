import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `findExpressionAnnotation` for CallExpression must infer type-param substitutions
// from runtime argument annotations when the caller omitted explicit `<...>` args.
// without inference `function makeBox<T>(t: T): { value: T }` + `makeBox(arr)` returns
// `{ value: T }` unsubstituted, dropping array narrowing on `b.value.at(0)` - emits
// generic `_at` instead of `_atMaybeArray`
function makeBox<T>(t: T): {
  value: T;
} {
  return {
    value: t
  };
}
declare const arr: number[];
const b = makeBox(arr);
_atMaybeArray(_ref = b.value).call(_ref, 0);