import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `Awaited<[...Promise<X>[]]>` distributes Awaited into the rest element: the rest's array element is
// `Promise<number[]>`, peeled to `number[]` (not left as an array of Promise). `t[0]` is then
// `number[]` and `.at` narrows to the array variant, matching the fixed-position tuple form
type T = Awaited<[...Promise<number[]>[]]>;
declare const t: T;
function go() {
  var _ref;
  _atMaybeArray(_ref = t[0]).call(_ref, 0);
}