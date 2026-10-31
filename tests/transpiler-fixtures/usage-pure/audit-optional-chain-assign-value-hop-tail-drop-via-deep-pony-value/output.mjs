import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a deeper all-ponyfilled navigation as the value: the leaf (`globalThis`) is the spelling
let d;
export const viaDeepPonyValue = _mapMaybeArray((d = _globalThis, _self).Array.prototype).call([1], x => x);