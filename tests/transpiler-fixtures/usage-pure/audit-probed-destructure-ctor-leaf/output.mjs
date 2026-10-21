import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
export const viaCtorLeaf = ((null == _globalThis.window ? void 0 : Array).of, _Array$of);
export const viaCtorLeafRenamed = ((null == _globalThis.window ? void 0 : Array).from, _Array$from);
export const viaCtorLeafDeep = ((null == _globalThis.window ? void 0 : Array).of, _Array$of);
let viaCtorLeafCascade;
viaCtorLeafCascade = ((null == _globalThis.window ? void 0 : Array).of, _Array$of);
export { viaCtorLeafCascade };
export const [{
  of: viaCtorLeafWrapped
}] = [_globalThis.window?.Array];
const heldCtorNav = _globalThis.window;
export const viaCtorLeafAlias = ((null == heldCtorNav ? void 0 : Array).of, _Array$of);
export const viaCtorLeafSealed = ((null == _globalThis.window ? void 0 : _self).Array, _Array$of);
export const {
  a: {
    of: viaCtorLeafLiteral
  }
} = {
  a: _globalThis.window?.Array
};