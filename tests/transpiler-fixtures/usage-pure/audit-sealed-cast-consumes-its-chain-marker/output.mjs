import _self from "@core-js/pure/actual/self";
// a TS cast over a navigation is consumed with the span the swap substitutes - but only ONE dialect
// puts a chain marker between the claim and that cast, and stopping the climb on the marker left the
// cast standing over the substituted binding with the `?.` the folding `delete` had already answered
let out, statics, instance, hop;
statics = delete _self.Number.MAX_SAFE_INTEGER;
instance = delete _self.Array.prototype.at;
hop = delete _self.noSuchStatic;
out = [statics, instance, hop];
export const read = out;