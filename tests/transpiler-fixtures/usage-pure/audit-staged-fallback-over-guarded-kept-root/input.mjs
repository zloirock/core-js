// the member is not itself polyfilled, so its RECEIVER carries the claim - but the ctor-fallback
// swap has no slot for the chain-assignment the receiver buries and stages instead. the ctor read
// below it must then keep its own render: standing down for a consumer that emits nothing shipped
// the constructor raw, and off-realm that read is the missing polyfill
var v;
var w;
export const staged = (v = globalThis.window?.self)?.Promise.noSuchStatic;
export const twin = (w = globalThis.window?.self)?.Set.noSuchStatic;
export const seen = [v, w];
