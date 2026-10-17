import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _globalThis from "@core-js/pure/actual/global-this";
// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
let tp;
export const inTemplate = `${null == (tp = _globalThis.window) ? void 0 : _findIndexMaybeArray(tp[c++, "Array"].prototype).call([7], v => v === 7)}`;