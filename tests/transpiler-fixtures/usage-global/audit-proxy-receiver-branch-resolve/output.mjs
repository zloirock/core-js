import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// usage-global parity: a proxy-global in a ternary / logical BRANCH (`(c ? globalThis.self : {}).X`) stays
// verbatim, so this locks that detection resolves the instance polyfill THROUGH the branch receiver AND
// injects `web.self` + `es.global-this` so the kept `globalThis.self` is DEFINED off-engine (never a raw
// undefined read / ie:11). array-only methods (a branch receiver is a union). distinct method per line.
let c = 1,
  x = null;
const ternary = (c ? globalThis.self : {}).Array.prototype.flat.call([1, [2]]);
const logicalOr = (x || globalThis.self).Array.prototype.findLast.call([1, 2], v => v > 1);
export { ternary, logicalOr };