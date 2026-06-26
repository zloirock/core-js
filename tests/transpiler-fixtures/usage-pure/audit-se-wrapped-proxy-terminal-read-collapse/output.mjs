import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// SE-wrapped proxy-global chains (`(eff(), globalThis.self).X`) in TERMINAL read positions: a bare static read,
// a non-global member, a `.window` hop, a class-extends superclass. The SE-tail proxy leaf is polyfilled to the
// pure root (`_globalThis`) instead of left raw - a bare `globalThis` is a ReferenceError in ie:11. The
// `.self` / `.window` hop resolves to the global in browsers (the target); the buried call effect is preserved.
let log = [];
function eff(tag) {
  _pushMaybeArray(log).call(log, tag);
  return tag;
}
const bareStatic = (eff('a'), _globalThis.self).Array;
const nonGlobal = (eff('b'), _globalThis.self).customProp;
const windowHop = (eff('c'), _globalThis.window).String;
class Extended extends (eff('d'), _globalThis.self).Error {}
export { bareStatic, nonGlobal, windowHop, Extended, log };