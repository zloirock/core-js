import _at from "@core-js/pure/actual/instance/at";
// reassignment INSIDE the discriminant test (`x.kind === 'a' && (x = other,
// true)`) invalidates narrow: by the time the body runs, x is the post-SE
// value, but the discriminant clause emitted the guard against the pre-SE
// binding. `discriminantGuardApplies` rejects when any reassignment overlaps
// testStart..testEnd, so the use stays unrefined and `.at` falls back to the
// generic instance polyfill
type Shape = { kind: 'a'; data: string } | { kind: 'b'; data: number[] };
declare const init: Shape;
declare const other: Shape;
let x: Shape = init;
if (x.kind === 'a' && (x = other, true)) {
  var _ref;
  _at(_ref = x.data).call(_ref, 0);
}