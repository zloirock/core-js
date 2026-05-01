import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
// AssignmentPattern default with LogicalExpression `Array || Iterator`:
// per design comment in destructure-emitter `handleObjectPropertyResult`, fromFallback
// triggers `tryRegisterPerBranchSynth`. Verify both branches become per-branch synth
// literals (Array.from polyfill on truthy left, Iterator.from polyfill on falsy left)
function f({} = Array || _Iterator) {
  let from = _Array$from;
  return from([1]);
}
export { f };