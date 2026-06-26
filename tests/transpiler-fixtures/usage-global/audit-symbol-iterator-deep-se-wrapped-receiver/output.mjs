import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// usage-global counterpart: detection must resolve the iterator polyfill THROUGH the same SE-wrapped /
// deep-hop receiver shapes and inject the side-effect import, keeping the source verbatim (no collapse in
// the global flavor). a regression-guard that the deeper-than-immediate receiver does not hide the symbol
// access from the usage detector. lines vary by RECEIVER shape exactly as the pure counterpart.
let c = 0;
const seWrapped = (c++, globalThis.self).Array.prototype[Symbol.iterator];
const computedKey = globalThis[c++, 'self'].Array.prototype[Symbol.iterator];
const plainDeep = globalThis.self.Array.prototype[Symbol.iterator];
const real = [1][Symbol.iterator];
export { seWrapped, computedKey, plainDeep, real, c };