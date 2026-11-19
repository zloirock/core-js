import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// usage-global counterpart: detection must resolve each array-method polyfill THROUGH the logical-wrapped
// SE proxy operand and inject the side-effect import, keeping the source verbatim (no collapse in the global
// flavor). a regression-guard that a logical wrapper does not hide the destructured
// method from the usage detector. statically-dead operands are the exception by design: an always-truthy
// left decides the value, so the short-circuited `||` RIGHT and the always-`{}` `&&` result inject nothing.
// lines vary by OPERATOR and OPERAND position exactly as the pure counterpart.
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