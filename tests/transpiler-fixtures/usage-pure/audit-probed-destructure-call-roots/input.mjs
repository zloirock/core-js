// pattern-hop (anchored) destructures over an UNDEFINABLE probe nav: the source read throws
// where the probe yields undefined, so every anchored render rides the guard-value spelling
// instead of the always-defined receiver / ctor bindings
// CALL-rooted probe navs: the guard test owns the single root-call run (a PURE proven call
// stays verbatim in the test; an SE call must not be replayed by the discard harvest; an
// identity-IIFE root substitutes its buried global)
const dhPure = () => globalThis;
export const { Math: { expm1: viaCallRootPure } } = (dhPure().window?.self);
let callRootEff = 0;
const dhSe = () => { callRootEff++; return globalThis; };
export const { JSON: { parse: viaCallRootSe } } = (dhSe().window?.self);
export const { Object: { values: viaCallRootIife } } = ((x => x)(globalThis).window?.self);
export { callRootEff };
