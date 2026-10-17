import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
export const bareSeKeyNewCallee = new (null == _globalThis.window ? void 0 : (c++, _self).CustomThing)();