import _Iterator from "@core-js/pure/actual/iterator/constructor";
// IIFE call-arg is a chain-assignment whose RHS is a conditional. tryRegisterPerBranchSynth
// must NOT peel chain assignment (chain-assign is the design-correct escape hatch and rewriting
// branches into synth literals would change the value bound to the outer variable)
let store;
const result = (({
  from
}) => from([1]))(store = cond ? Array : _Iterator);
export { result, store };