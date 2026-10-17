import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
// a nullish-coalescing carrier over the probe chain: the guarded render is the left operand
export const nullishCarrier = (null == _globalThis.window ? void 0 : (c++, _self).JSON) ?? 'absent';