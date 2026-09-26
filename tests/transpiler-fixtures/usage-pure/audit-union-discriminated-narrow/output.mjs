import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Discriminated union narrowing via a `kind === 'a'` tag selects the branch
// whose `data` is `string[]`. `.at(0)` then gets the array-specific polyfill.
type Shape = {
  kind: 'a';
  data: string[];
} | {
  kind: 'b';
  data: number;
};
declare const s: Shape;
if (s.kind === 'a') _atMaybeArray(_ref = s.data).call(_ref, 0);