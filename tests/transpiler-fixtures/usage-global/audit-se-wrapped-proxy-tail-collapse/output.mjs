import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A proxy-global receiver carried as the TAIL of a side-effecting SequenceExpression, on instance-method and
// destructure sources: `(eff(), globalThis.self).Array.prototype.flat`. babel and unplugin BOTH collapse the
// proxy hop to the pure root and harvest the prefix effect ahead of it (`(eff(), _globalThis).Array.prototype`)
// - no raw `.self` that reads undefined off-engine (ie:11 / Node). covers the SE-wrapped TAIL, the SE-PREFIX
// root (`(eff(), globalThis).self.X`), a destructure source, and a DOUBLE hop. distinct instance method per line.
let log = [];
function eff(tag) {
  log.push(tag);
  return tag;
}
const callInst = (eff('a'), globalThis.self).Array.prototype.flat.call([1, [2]]);
const prefixRoot = (eff('b'), globalThis).self.Array.prototype.includes.call([1], 1);
const {
  flatMap
} = (eff('c'), globalThis.self).Array.prototype;
const doubleHop = (eff('d'), globalThis.self.window).Array.prototype.at.call([5, 6], 0);
export { callInst, prefixRoot, flatMap, doubleHop, log };