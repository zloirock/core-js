// usage-global counterpart: detection must resolve each polyfill THROUGH the nested-sequence proxy receiver
// and inject the side-effect import, keeping the source verbatim (no collapse in the global flavor). a
// regression-guard that nested sequence wrappers do not hide the consuming member/symbol from the usage
// detector. lines vary by CONSUMING form and nesting DEPTH exactly as the pure counterpart.
let a = 0, b = 0, c = 0, d = 0;
const memberDirect = (c++, (d++, globalThis.self)).Array.prototype.flat.call([1, [2]]);
const instanceAt = (c++, (d++, globalThis.self)).Array.prototype.at.call([1], 0);
const symbolIter = (a++, (b++, (c++, globalThis.self))).Array.prototype[Symbol.iterator];
const single = (d++, globalThis.self).Array.prototype.includes.call([1], 1);
export { memberDirect, instanceAt, symbolIter, single, a, b, c, d };
