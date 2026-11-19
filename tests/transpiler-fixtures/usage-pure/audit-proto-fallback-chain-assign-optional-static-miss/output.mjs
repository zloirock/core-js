import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a bare non-polyfilled static read under the same root rides the guarded claim
let m;
export const optionalStaticMiss = null == (m = _globalThis.window) ? void 0 : _Promise.noSuchStatic;