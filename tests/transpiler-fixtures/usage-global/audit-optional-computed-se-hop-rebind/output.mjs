import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// usage-global parity for an OPTIONAL chain on a computed proxy-global hop with a side-effecting key
// `globalThis[(eff(), 'self')]?.X`. usage-global keeps the member verbatim (the key effect is never folded
// away) and resolves the instance polyfills THROUGH the optional hop, injecting each side-effect import. the
// multi-type methods (at, includes) on the explicit Array.prototype inject ONLY the array module - the receiver
// type resolves through the optional hop. distinct instance method per line so no two lines share a chain.
let log = [];
function eff(tag) {
  log.push(tag);
  return tag;
}
const atRes = globalThis[eff('a'), 'self']?.Array.prototype.at.call([1, [2]], 0);
const incRes = globalThis[eff('b'), 'self']?.Array.prototype.includes.call([1], 1);
export { atRes, incRes, log };