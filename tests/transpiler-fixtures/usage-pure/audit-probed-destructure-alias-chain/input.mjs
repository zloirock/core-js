// A held window probe remains observable through direct, nested and rest-bearing static reads.
// The literal-array twin keeps its native property read.
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
