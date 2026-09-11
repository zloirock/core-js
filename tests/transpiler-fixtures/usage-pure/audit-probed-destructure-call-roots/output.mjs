import _globalThis from "@core-js/pure/actual/global-this";
import _JSON$parse from "@core-js/pure/actual/json/parse";
import _Math$expm1 from "@core-js/pure/actual/math/expm1";
import _Object$values from "@core-js/pure/actual/object/values";
import _self from "@core-js/pure/actual/self";
// pattern-hop (anchored) destructures over an UNDEFINABLE probe nav: the source read throws
// where the probe yields undefined, so every anchored render rides the guard-value spelling
// instead of the always-defined receiver / ctor bindings
// CALL-rooted probe navs: the guard test owns the single root-call run (a PURE proven call
// stays verbatim in the test; an SE call must not be replayed by the discard harvest; an
// identity-IIFE root substitutes its buried global)
const dhPure = () => _globalThis;
export const viaCallRootPure = ((null == dhPure().window ? void 0 : _self).Math, _Math$expm1);
let callRootEff = 0;
const dhSe = () => {
  callRootEff++;
  return _globalThis;
};
export const viaCallRootSe = ((null == dhSe().window ? void 0 : _self).JSON, _JSON$parse);
export const viaCallRootIife = ((null == (x => x)(_globalThis).window ? void 0 : _self).Object, _Object$values);
export { callRootEff };