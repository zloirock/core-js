import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// literal root through the static-FALLBACK path; root collapses, NO dead `_Promise`
export const litFell = null == _globalThis.window ? void 0 : _Promise.noSuchStatic;