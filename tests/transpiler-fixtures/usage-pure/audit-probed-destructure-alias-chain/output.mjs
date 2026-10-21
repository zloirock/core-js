import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Shared capture and receiver-default routes preserve independently supported claims.
// Binding identity, writes and later reads retain their existing inference and ordering.
const heldProbe = _globalThis.window;
export const viaAliasChainDecl = (heldProbe.Array, _Array$of);
let viaAliasChainAssign;
viaAliasChainAssign = (heldProbe.Array, _Array$of);
export { viaAliasChainAssign };
export const [{
  of: viaAliasChainWrapped
}] = [heldProbe.Array];
export const {
  Array: {
    of: viaAliasChainNested
  }
} = ({} = heldProbe, {
  Array: {
    of: _Array$of
  }
});
export const viaAliasChainMultiA = (heldProbe.Array, _Array$of);
export const viaAliasChainMultiB = _Array$from;
const _ref = heldProbe.Array,
  viaAliasChainRestA = _Array$of,
  {
    of: _unused,
    ...viaAliasChainRest
  } = _ref;
export { viaAliasChainRestA, viaAliasChainRest };