import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// usage-global counterpart: detection must resolve each array-method polyfill THROUGH the nested-sequence,
// SE-bearing computed-key proxy operand and inject the side-effect import, keeping the source verbatim (no
// collapse in the global flavor). the multi-type methods (includes, at) on a bare declarator / assignment
// inject ONLY the array module (not the string module) - the receiver-type inference resolves through the SE
// computed key to a single concrete Array.prototype. the logical hosts carry ARRAY-ONLY methods (flat, findLast):
// an always-truthy left decides a logical statically - `||` narrows to the LEFT (flat still injected), `&&`
// narrows to the RIGHT `{}` (findLast unreachable - its module is NOT injected), source kept verbatim.
let a = 0,
  b = 0,
  c = 0,
  d = 0,
  e = 0,
  x;
const {
  flat
} = (c++, d++, globalThis)[e++, 'self'].Array.prototype || {};
const {
  findLast
} = (c++, globalThis)[e++, 'self'].Array.prototype && {};
const {
  includes
} = (a++, b++, globalThis)[c++, 'self'].Array.prototype;
({
  at: x
} = (c++, globalThis)[e++, 'self'].Array.prototype);
export { flat, findLast, includes, x, a, b, c, d, e };