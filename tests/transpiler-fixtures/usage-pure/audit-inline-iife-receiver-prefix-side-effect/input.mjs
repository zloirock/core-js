// an inline-resolvable IIFE receiver folds to its returned static and the call is dropped - so the
// call's PREFIX side effects must ride meta.sideEffects (re-emitted as a leading sequence). the effect
// gate mirrors the fold recursion: an identity-param IIFE block body (`((x) => { eff; return x; })(Ctor)`)
// and a sequence-tail inner IIFE (`(() => (0, (() => { eff; return Ctor; })()))()`) both keep the effect.
// a clean identity IIFE folds to the standalone static with NO leftover ctor import. distinct static per line
let log = 0;
export const a = ((x) => { log++; return x; })(Array).from([1]);
export const b = (() => (0, (() => { log++; return Object; })()))().fromEntries([['k', 1]]);
export const c = ((x) => x)(Promise).withResolvers();
export { log };
