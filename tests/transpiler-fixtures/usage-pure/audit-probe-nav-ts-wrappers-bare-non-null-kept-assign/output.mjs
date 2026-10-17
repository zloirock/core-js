import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A non-null wrapper preserves the kept assignment and the source optional branch.
// The store retains its terminal environment probe; the unconsumed navigation follows
// the ordinary realm-collapse rule. The wrapper itself introduces no runtime check.
let kv;
export const bareNonNullKeptAssign = (kv = null == _globalThis.window ? void 0 : _self.window)?.BigInt;