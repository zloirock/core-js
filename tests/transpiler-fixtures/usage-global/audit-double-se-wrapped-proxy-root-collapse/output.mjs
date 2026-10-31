import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.includes";
import "core-js/modules/web.self";
// usage-global parity for a DOUBLE side effect - one in the proxy-global ROOT wrapper `(eff(), globalThis)` AND
// one in the proxy HOP key `[(eff(), 'self')]` - on an instance-method receiver. usage-global keeps the member
// verbatim (neither effect is folded away) and resolves the instance polyfills THROUGH the doubly-SE proxy chain,
// injecting each side-effect import. mirrors the pure shape set: instance `.call`, destructure binding, DOUBLE
// hop. multi-type methods (includes / at) resolve their TYPE through the doubly-SE chain so the array variant
// injects only the array module and the string-receiver line only the string module. distinct method per line.
let log = [];
function eff(tag) {
  log.push(tag);
  return 0;
}
const callInstance = (eff('a'), globalThis)[eff('b'), 'self'].Array.prototype.includes.call([1, 2], 1);
const {
  at
} = (eff('c'), globalThis)[eff('d'), 'self'].Array.prototype;
const doubleHop = (eff('e'), globalThis)[eff('f'), 'self'][eff('g'), 'window'].String.prototype.includes.call('abc', 'a');
export { callInstance, at, doubleHop, log };