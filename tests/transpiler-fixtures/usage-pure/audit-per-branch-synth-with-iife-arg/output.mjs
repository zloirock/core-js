import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// IIFE call-arg is a conditional with two known polyfillable branches. tryRegisterPerBranchSynth
// fires from handleParameterDestructurePure when meta.fromFallback is set. each branch should
// be rewritten to a synth literal independently, preserving the polyfill-always-wins contract
const result = (({
  from
}) => from([1]))(cond ? {
  from: _Array$from
} : {
  from: _Iterator$from
});
export { result };