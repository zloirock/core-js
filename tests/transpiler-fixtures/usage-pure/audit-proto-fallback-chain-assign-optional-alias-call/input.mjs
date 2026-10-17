// the ALIAS-valued root guards through its verbatim slice (no raw global inside the assign)
const w2 = globalThis.window;
let a;
export const optionalAliasCall = (a = w2)?.self.WeakMap.prototype.get.call(new WeakMap(), {});
