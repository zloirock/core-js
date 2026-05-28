import _at from "@core-js/pure/actual/instance/at";
// `for (w = init-shape; cond; w = update-shape) { use w }` - iteration 2+ runs the
// for-update assignment before the body, so the narrow inside the body can't trust
// init's RHS shape. without the for-update check, the body sees the array-narrow
// and emits only `_atMaybeArray`; with the check, the narrow bails to the declared
// union and emits both array AND string Maybe-variants
type Shape = { tag: 'a'; data: number[] } | { tag: 'b'; data: string };
declare const init: Shape;
declare const cond: boolean;
let w: Shape = init;
for (w = { tag: 'a', data: [1, 2, 3] }; cond; w = { tag: 'b', data: 'hi' }) {
  var _ref;
  _at(_ref = w.data).call(_ref, -1);
}
