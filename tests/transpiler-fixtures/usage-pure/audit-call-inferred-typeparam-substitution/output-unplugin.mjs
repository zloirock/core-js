import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `makeBox<T>(arr)` without explicit type args still narrows `b.value` to an array,
// so `.at(0)` picks the array-specific polyfill.
function makeBox<T>(t: T): { value: T } {
  return { value: t };
}
declare const arr: number[];
const b = makeBox(arr);
_atMaybeArray(_ref = b.value).call(_ref, 0);