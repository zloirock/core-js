import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a TS cast over a sealed probe nav under `delete` is consumed with the span the render substitutes,
// in both dialects: no cast is left standing over the substituted binding beside a `?.` the guard
// already answered.
let out, statics, instance, hop;
statics = delete (null == (() => _globalThis)().window ? void 0 : _self)?.Number.MAX_SAFE_INTEGER;
instance = delete (null == (() => _globalThis)().window ? void 0 : _self)?.Array.prototype.at;
hop = null == (() => _globalThis)().window ? true : delete _self.window.noSuchStatic;
out = [statics, instance, hop];
export const read = out;