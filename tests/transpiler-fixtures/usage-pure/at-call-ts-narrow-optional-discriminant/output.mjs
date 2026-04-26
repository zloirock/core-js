import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// discriminated union narrowing through an optional-chain discriminant `s?.kind === 'a'`.
// Inside the guarded branch, `s.data` narrows to `number[]`, so `.at(0)` rewrites to the
// array-specific instance polyfill (parity with the non-optional `s.kind === 'a'` form).
type Shape = {
  kind: 'a';
  data: number[];
} | {
  kind: 'b';
  data: string;
};
declare const s: Shape;
if (s?.kind === 'a') {
  var _ref;
  _atMaybeArray(_ref = s.data).call(_ref, 0);
}