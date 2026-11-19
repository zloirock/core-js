import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// a NON-mutated polyfillable builtin in the same nav shape: nothing cancels the claim, so the
// leaf routes through its ponyfill while the guard still binds the undefinable root
let nm;
export const nonMutatedStatic = null == (nm = _globalThis.window) ? void 0 : _Map$groupBy([1], x => x);