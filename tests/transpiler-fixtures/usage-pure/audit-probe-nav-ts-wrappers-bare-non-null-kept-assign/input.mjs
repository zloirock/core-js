// A non-null wrapper preserves the kept assignment and the source optional branch.
// The store retains its terminal environment probe; the unconsumed navigation follows
// the ordinary realm-collapse rule. The wrapper itself introduces no runtime check.
let kv;
export const bareNonNullKeptAssign = (kv = globalThis.window?.self!.window)?.BigInt;
