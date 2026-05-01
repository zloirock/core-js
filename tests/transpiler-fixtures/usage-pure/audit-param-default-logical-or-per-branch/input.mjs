// AssignmentPattern default with LogicalExpression `Array || Iterator`:
// per design comment in destructure-emitter `handleObjectPropertyResult`, fromFallback
// triggers `tryRegisterPerBranchSynth`. Verify both branches become per-branch synth
// literals (Array.from polyfill on truthy left, Iterator.from polyfill on falsy left)
function f({ from } = Array || Iterator) {
  return from([1]);
}
export { f };
