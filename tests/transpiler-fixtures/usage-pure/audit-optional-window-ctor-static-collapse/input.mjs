// a ctor STATIC reached THROUGH a kept undefinable window guard (`(w = globalThis.window)?.Number
// .MAX_SAFE_INTEGER`, `?.Number.parseInt(...)`): the ctor (`Number`) carries no pure GLOBAL entry, but the
// static (`Number.MAX_SAFE_INTEGER` / `Number.parseInt`) does. the static is receiver-INDEPENDENT, so it
// collapses to its pure form (`_Number$MAX_SAFE_INTEGER`) with the root SE owned by the guard - not a raw
// `_ref.Number.MAX_SAFE_INTEGER` read off the memo (native = missed polyfill). single-hop and multi-hop
// (self.window) roots; a trailing instance method, a static-call, and a bare static-call. both emitters converge.
let w, v, u;
export const maxSafe = (w = globalThis.window)?.Number.MAX_SAFE_INTEGER.toFixed(1);
export const parseHop = (v = globalThis.self.window)?.Number.parseInt("42", 10);
export const isInt = (u = globalThis.window)?.Number.isInteger(5);
