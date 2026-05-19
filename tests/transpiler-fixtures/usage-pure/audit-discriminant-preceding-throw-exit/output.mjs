import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// preceding early-exit via `throw`: `if (w.kind !== 'a') throw ...;` narrows w
// to the 'a' branch for the rest of the block. `collectPrecedingExitDiscriminants`
// walks sibling statements, identifies the if-with-throw as an unconditional
// exit, and emits the (negated) clause as a discriminant guard. mirrors the
// `return` form already covered by `audit-narrow-discriminated-early-exit`
type Shape = {
  kind: 'a';
  data: string;
} | {
  kind: 'b';
  data: number[];
};
declare const w: Shape;
function probe() {
  var _ref;
  if (w.kind !== 'a') throw new Error('expected a');
  _atMaybeString(_ref = w.data).call(_ref, 0);
}
probe();