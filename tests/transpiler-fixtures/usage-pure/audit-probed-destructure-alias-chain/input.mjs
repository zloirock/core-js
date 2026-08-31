const heldProbe = globalThis.window;
// an ALIAS holding the probe one hop below the consumed init (`= heldProbe.Array`): the
// binding makes the discarded read observable with no `?.` for the guard to key on, so the
// extraction re-emits it as a throw probe - declarator, assignment-host, array-wrapped and
// nested-hop spellings alike; a rest sibling keeps its residual (the residual re-reads the
// init and carries the throw itself). the probe rides ONE extraction per pattern; WHICH one
// carries it differs per leg inside the documented partial-assignment-on-throw boundary
// (babel: the last prop standing; the ast leg: the first extraction) - the sidecar records it
export const { of: viaAliasChainDecl } = heldProbe.Array;
let viaAliasChainAssign;
({ of: viaAliasChainAssign } = heldProbe.Array);
export { viaAliasChainAssign };
export const [{ of: viaAliasChainWrapped }] = [heldProbe.Array];
export const { Array: { of: viaAliasChainNested } } = heldProbe;
export const { of: viaAliasChainMultiA, from: viaAliasChainMultiB } = heldProbe.Array;
export const { of: viaAliasChainRestA, ...viaAliasChainRest } = heldProbe.Array;
