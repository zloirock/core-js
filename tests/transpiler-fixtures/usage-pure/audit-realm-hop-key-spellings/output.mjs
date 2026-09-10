import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a realm hop's key names its slot through the CANON key resolver, never through the shape the key
// node happens to carry: a string literal, a template, an SE-bearing key's quiet tail and a key
// BOUND to a constant string all name the hop its dotted twin names, so the fold drops them alike.
// the observable is the TEXT both emitters print - the import sets are identical either way, so no
// differential row can see this, and `usage-global` rewrites no source to hold a twin
const litKey = 'window';
const chainedKey = litKey;
let reassigned = 'window';
reassigned = 'frames';
let e = 0;
let m;
let m2;
let s;
export const dotted = _self.probe;
export const stringKey = _self.probe;
export const templateKey = _self.probe;
export const boundKey = _self.probe;
export const boundChain = _self.probe;
export const seqKey = (e++, _self).probe;
export const seqKeyStoreRoot = (s = _globalThis, e++, _self).probe;
// ... and the boundary: a key the resolver cannot name is no name at all - the hop keeps its place
// over the deepest span pure can back, and so does one naming no realm surface
export const reassignedKey = _self[reassigned].probe;
export const dynamicKey = dyn => _self[dyn].probe;
export const nonRealmKey = _self[chainedKey.length].probe;
// ... and the same name decides the GUARD a stored probe nav earns: the hop is the environment probe
// whichever key spells it, so the store keeps its test instead of reading an always-defined ponyfill
export const storedProbeDotted = null == (m = null == _globalThis.window ? void 0 : _self) ? void 0 : _Array$of(1);
export const storedProbeBoundKey = null == (m2 = null == _globalThis[litKey] ? void 0 : _self) ? void 0 : _Array$from([2]);
export { e, m, m2, s };