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
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.self";
// usage-global counterpart: detection must resolve each array-method polyfill THROUGH the logical-wrapped
// SE proxy operand and inject the side-effect import, keeping the source verbatim (no collapse in the global
// flavor). a regression-guard that a `X || fallback` / `X && fallback` wrapper does not hide the destructured
// method from the usage detector. lines vary by OPERATOR and OPERAND position exactly as the pure counterpart.
let c = 0;
const {
  flat
} = (c++, globalThis.self).Array.prototype || {};
const {
  at
} = (c++, globalThis.self).Array.prototype && {};
const {
  includes
} = {} || (c++, globalThis.self).Array.prototype;
const {
  map
} = [1] || {};
export { flat, at, includes, map, c };