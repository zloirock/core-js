import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// usage-global parity: a proxy-global receiver wrapped in a transparent value position (array element,
// object-literal value read back through a member) stays verbatim, so this locks that detection resolves
// the instance polyfill THROUGH the wrapper AND injects `es.global-this` (+ `web.self` for the kept hop) so
// `globalThis.self` is DEFINED off-engine. multi-type methods (includes, at) inject ONLY the array module -
// the single concrete Array.prototype receiver narrows. distinct method per line.
const arrayElem = [globalThis.self.Array.prototype][0].includes.call([1], 1);
const objMember = {
  box: globalThis.self.Array.prototype
}.box.at.call([1], 0);
export { arrayElem, objMember };