import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// usage-global counterpart: detection must resolve each polyfill THROUGH the nested-sequence receiver with a
// trailing redundant hop and inject the side-effect import, keeping the source verbatim (no collapse in the
// global flavor). a regression-guard that a trailing `.window` / `.self.window` hop past a nested sequence
// does not hide the consuming member from the usage detector. lines vary by depth and hop count as in pure.
let a = 0,
  b = 0,
  c = 0,
  d = 0;
const oneHop = (c++, d++, globalThis.self).window.Array.prototype.flat.call([1, [2]]);
const twoHops = (c++, d++, globalThis).self.window.Array.prototype.at.call([1], 0);
const tripleSeq = (a++, b++, c++, globalThis.self).window.Array.prototype.includes.call([1], 1);
export { oneHop, twoHops, tripleSeq, a, b, c, d };