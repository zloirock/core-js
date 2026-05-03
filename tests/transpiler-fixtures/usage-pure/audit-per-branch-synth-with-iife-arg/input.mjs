// IIFE call-arg is a conditional with two known polyfillable branches. tryRegisterPerBranchSynth
// fires from handleParameterDestructurePure when meta.fromFallback is set. each branch should
// be rewritten to a synth literal independently, preserving the polyfill-always-wins contract
const result = (({ from }) => from([1]))(cond ? Array : Iterator);
export { result };
