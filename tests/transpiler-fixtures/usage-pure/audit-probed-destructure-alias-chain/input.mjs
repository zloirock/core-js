// Shared capture and receiver-default routes preserve independently supported claims.
// Binding identity, writes and later reads retain their existing inference and ordering.
const heldProbe = globalThis.window;
export const { of: viaAliasChainDecl } = heldProbe.Array;
let viaAliasChainAssign;
({ of: viaAliasChainAssign } = heldProbe.Array);
export { viaAliasChainAssign };
export const [{ of: viaAliasChainWrapped }] = [heldProbe.Array];
export const { Array: { of: viaAliasChainNested } } = heldProbe;
export const { of: viaAliasChainMultiA, from: viaAliasChainMultiB } = heldProbe.Array;
export const { of: viaAliasChainRestA, ...viaAliasChainRest } = heldProbe.Array;
