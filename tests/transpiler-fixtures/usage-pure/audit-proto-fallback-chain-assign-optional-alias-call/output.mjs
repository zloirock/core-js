import _globalThis from "@core-js/pure/actual/global-this";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// the ALIAS-valued root guards through its verbatim slice (no raw global inside the assign)
const w2 = _globalThis.window;
let a;
export const optionalAliasCall = null == (a = w2) ? void 0 : _WeakMap.prototype.get.call(new _WeakMap(), {});