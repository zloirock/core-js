import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
// Stored quiet realm runs retain their prefix, write and probe contracts.
// Effectful realm keys keep their source evaluation.
let c = 0;
let k = 0;
let seqStored;
export const seqPrefixAhead = null == (seqStored = (c++, _self).window?.Array) ? void 0 : _Array$from([1]);
let root;
let writeStored;
export const writeUnderTheRun = null == (writeStored = (root = _globalThis, _self).window?.Promise) ? void 0 : _Promise$resolve(1);
let probeStored;
export const probeInsideTheSpan = (probeStored = null == _globalThis.window ? void 0 : _self.Object)?.keys({});
let keyStored;
export const seKeyInsideTheSpan = (keyStored = (c++, _globalThis).window?.[k++, 'self'].Number)?.isInteger(1);
let plainStored;
export const plainSpanLandsWhole = null == (plainStored = _self.window?.Array) ? void 0 : _Array$of(4);
export { c, k, root };