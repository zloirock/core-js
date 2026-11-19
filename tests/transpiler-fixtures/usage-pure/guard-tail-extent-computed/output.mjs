import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A quiet realm key folds with its dotted twin; a key effect keeps the source read.
export const quiet = () => null == _globalThis.window ? void 0 : _self;
export const effectful = () => null == _globalThis.window ? void 0 : _self[_Array$of(3)[0], 'window'];