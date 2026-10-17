import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
export const holder = {
  get val() {
    let gt;
    return null == (gt = _globalThis.window) ? void 0 : _mapMaybeArray(gt[c++, "Array"].prototype).call([9], v => v);
  }
};