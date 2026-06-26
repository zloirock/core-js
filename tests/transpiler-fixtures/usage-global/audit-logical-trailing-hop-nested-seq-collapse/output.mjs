import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/web.self";
// usage-global counterpart: detection must resolve each array-method polyfill THROUGH the logical-wrapped,
// nested-sequence, trailing-hop proxy operand and inject the side-effect import, keeping the source verbatim
// (no collapse in the global flavor). a regression-guard that the deep wrapper does not hide the method.
let a = 0,
  b = 0,
  c = 0,
  d = 0;
const {
  flat
} = (c++, d++, globalThis.self).window.Array.prototype || {};
const {
  at
} = (c++, d++, globalThis.self).window.Array.prototype && {};
const {
  includes
} = (a++, b++, c++, globalThis.self).self.window.Array.prototype || {};
const {
  map
} = (d++, globalThis.self).Array.prototype || {};
export { flat, at, includes, map, a, b, c, d };