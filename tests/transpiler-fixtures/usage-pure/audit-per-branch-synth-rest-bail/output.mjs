import _Iterator from "@core-js/pure/actual/iterator/constructor";
// per-branch synth-swap with a rest sibling: `function f({a, ...rest} = cond ? A : B)`.
// pattern carries RestElement, so synth-swap can't reshape it without losing rest's
// runtime exclusion semantics. tryRegisterPerBranchSynth must reject via
// isSynthSimpleObjectPattern; bare constructor identifiers in the conditional may still
// be polyfilled by the global identifier visitor independent of the per-branch path
function f({
  from,
  ...rest
} = cond ? Array : _Iterator) {
  return [from, rest];
}
export { f };