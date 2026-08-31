import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";

const heldProbe = _globalThis.window;

// an ALIAS holding the probe one hop below the consumed init (`= heldProbe.Array`): the
// binding makes the discarded read observable with no `?.` for the guard to key on, so the
// extraction re-emits it as a throw probe - declarator, assignment-host, array-wrapped and
// nested-hop spellings alike; a rest sibling keeps its residual (the residual re-reads the
// init and carries the throw itself). the probe rides ONE extraction per pattern; WHICH one
// carries it differs per leg inside the documented partial-assignment-on-throw boundary
// (babel: the last prop standing; the ast leg: the first extraction) - the sidecar records it
export const viaAliasChainDecl = (heldProbe.Array, _Array$of);

let viaAliasChainAssign;

viaAliasChainAssign = (heldProbe.Array, _Array$of);

export { viaAliasChainAssign };
export const viaAliasChainWrapped = (heldProbe.Array, _Array$of);
export const viaAliasChainNested = ((null == heldProbe ? void 0 : heldProbe).Array, _Array$of);
export const viaAliasChainMultiA = (heldProbe.Array, _Array$of);
export const viaAliasChainMultiB = _Array$from;
export const viaAliasChainRestA = _Array$of;
export const { of: _unused, ...viaAliasChainRest } = heldProbe.Array;