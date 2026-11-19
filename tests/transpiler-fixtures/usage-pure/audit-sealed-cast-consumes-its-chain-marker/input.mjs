// a TS cast over a sealed probe nav under `delete` is consumed with the span the render substitutes,
// in both dialects: no cast is left standing over the substituted binding beside a `?.` the guard
// already answered.
let out, statics, instance, hop;
statics = delete ((() => globalThis)().window?.self as any)?.Number.MAX_SAFE_INTEGER;
instance = delete ((() => globalThis)().window?.self as any)?.Array.prototype.at;
hop = delete ((() => globalThis)().window?.self as any)?.window.noSuchStatic;
out = [statics, instance, hop];
export const read = out;
