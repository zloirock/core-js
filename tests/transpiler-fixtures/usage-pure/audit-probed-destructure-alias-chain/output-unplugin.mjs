// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";

const heldProbe = _globalThis.window;

export const viaAliasChainDecl = (heldProbe.Array, _Array$of);

let viaAliasChainAssign;

viaAliasChainAssign = (heldProbe.Array, _Array$of);

export { viaAliasChainAssign };
export const viaAliasChainWrapped = (heldProbe.Array, _Array$of);
export const viaAliasChainNested = ((null == heldProbe ? void 0 : heldProbe).Array, _Array$of);

// In a full consume with several properties, one extraction carries the throw probe.
// The emitters may choose different properties within the partial-assignment-on-throw boundary.
export const viaAliasChainMultiA = (heldProbe.Array, _Array$of);

export const viaAliasChainMultiB = _Array$from;
export const { of: viaAliasChainRestA, ...viaAliasChainRest } = heldProbe.Array;