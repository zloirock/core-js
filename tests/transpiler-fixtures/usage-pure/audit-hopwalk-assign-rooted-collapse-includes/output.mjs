import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// A chain assignment in a proxy navigation preserves its write and effects. A collapsed backed hop must use the assigned ponyfill
// value instead of leaving a raw realm hop.
let a, b, c, d, m, n, w;
const g = _globalThis;
export const includes = _includesMaybeArray((c = g, g).Array.prototype);