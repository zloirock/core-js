import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// optional spellings deopt (a resolvable root's guard is dead; the hop value is always
// defined) and collapse identically
let oa;
export const optionalRoot = (oa = _globalThis, _self)[0];