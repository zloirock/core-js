// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const heldProbe = globalThis.window;
export const { of: viaAliasChainDecl } = heldProbe.Array;
let viaAliasChainAssign;
({ of: viaAliasChainAssign } = heldProbe.Array);
export { viaAliasChainAssign };
export const [{ of: viaAliasChainWrapped }] = [heldProbe.Array];
export const { Array: { of: viaAliasChainNested } } = heldProbe;
// In a full consume with several properties, one extraction carries the throw probe.
// The emitters may choose different properties within the partial-assignment-on-throw boundary.
export const { of: viaAliasChainMultiA, from: viaAliasChainMultiB } = heldProbe.Array;
export const { of: viaAliasChainRestA, ...viaAliasChainRest } = heldProbe.Array;
