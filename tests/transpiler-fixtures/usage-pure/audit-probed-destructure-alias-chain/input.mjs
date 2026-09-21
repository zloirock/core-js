// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const heldProbe = globalThis.window;
export const { of: viaAliasChainDecl } = heldProbe.Array;
let viaAliasChainAssign;
({ of: viaAliasChainAssign } = heldProbe.Array);
export { viaAliasChainAssign };
export const [{ of: viaAliasChainWrapped }] = [heldProbe.Array];
export const { Array: { of: viaAliasChainNested } } = heldProbe;
// In a full consume, the throw probe precedes the first extracted binding.
export const { of: viaAliasChainMultiA, from: viaAliasChainMultiB } = heldProbe.Array;
export const { of: viaAliasChainRestA, ...viaAliasChainRest } = heldProbe.Array;
