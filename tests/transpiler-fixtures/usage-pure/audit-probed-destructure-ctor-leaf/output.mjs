import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Constructor-leaf probes preserve the source's potentially throwing read before a static extraction.
// Aliases and seals retain their boundaries; literal-wrapper twins stay native.
export const viaCtorLeaf = ((_globalThis.window?.Array).of, _Array$of);
export const viaCtorLeafRenamed = ((_globalThis.window?.Array).from, _Array$from);
export const viaCtorLeafDeep = ((_globalThis.window?.Array).of, _Array$of);
let viaCtorLeafCascade;
viaCtorLeafCascade = ((_globalThis.window?.Array).of, _Array$of);
export { viaCtorLeafCascade };
export const [{
  of: viaCtorLeafWrapped
}] = [null == _globalThis.window ? void 0 : {
  of: _Array$of
}];
const heldCtorNav = _globalThis.window;
export const viaCtorLeafAlias = ((heldCtorNav?.Array).of, _Array$of);
export const viaCtorLeafSealed = ((null == _globalThis.window ? void 0 : _self).Array, _Array$of);
export const {
  a: {
    of: viaCtorLeafLiteral
  }
} = {
  a: null == _globalThis.window ? void 0 : {
    of: _Array$of
  }
};