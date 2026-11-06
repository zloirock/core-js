import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Dotted, literal, template and bound quiet realm keys retain their existing fold.
// Effectful and unknown keys keep their native reads; stored quiet runs keep their landing.
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
export const seqKey = _self[e++, 'window'].probe;
export const seqKeyStoreRoot = (s = _globalThis, _self)[e++, 'window'].probe;
export const reassignedKey = _self[reassigned].probe;
export const dynamicKey = dyn => _self[dyn].probe;
export const nonRealmKey = _self[chainedKey.length].probe;
export const storedProbeDotted = (m = _self, _Array$of)(1);
export const storedProbeBoundKey = (m2 = _self, _Array$from)([2]);
export { e, m, m2, s };