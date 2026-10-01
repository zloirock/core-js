// a TS cast over a navigation is consumed with the span the swap substitutes - but only ONE dialect
// puts a chain marker between the claim and that cast, and stopping the climb on the marker left the
// cast standing over the substituted binding with the `?.` the folding `delete` had already answered
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";

let out, statics, instance, hop;

statics = delete ((null == (() => _globalThis)().window ? void 0 : _self) as any)?.Number.MAX_SAFE_INTEGER;
instance = delete ((null == (() => _globalThis)().window ? void 0 : _self) as any)?.Array.prototype.at;
hop = delete ((null == (() => _globalThis)().window ? void 0 : _self) as any)?.window.noSuchStatic;
out = [statics, instance, hop];

export const read = out;