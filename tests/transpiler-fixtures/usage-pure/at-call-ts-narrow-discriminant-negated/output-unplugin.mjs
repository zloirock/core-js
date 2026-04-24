import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Negated discriminant `s?.kind !== 'b'` via optional chain. Plugin narrows the
// union to the `kind: 'a'` branch (excluding 'b'), so `s.data` is `number[]` and
// `.at(0)` gets the array-specific polyfill.
type Shape = { kind: 'a'; data: number[] } | { kind: 'b'; data: string };
declare const s: Shape;
if (s?.kind !== 'b') {
var _ref;
  _atMaybeArray(_ref = s.data).call(_ref, 0);
}
