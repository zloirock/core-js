import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const heldProbe = _globalThis.window;
export const viaAliasChainDecl = (heldProbe.Array, _Array$of);
let viaAliasChainAssign;
viaAliasChainAssign = (heldProbe.Array, _Array$of);
export { viaAliasChainAssign };
export const [{
  of: viaAliasChainWrapped
}] = [{
  of: _Array$of
}];
export const {
  Array: {
    of: viaAliasChainNested
  }
} = ({} = heldProbe, {
  Array: {
    of: _Array$of
  }
});
// In a full consume, the throw probe precedes the first extracted binding.
export const viaAliasChainMultiA = (heldProbe.Array, _Array$of);
export const viaAliasChainMultiB = _Array$from;
const _ref = heldProbe.Array,
  viaAliasChainRestA = null == _ref ? _ref[""] : _Array$of,
  {
    of: _unused,
    ...viaAliasChainRest
  } = _ref;
export { viaAliasChainRestA, viaAliasChainRest };