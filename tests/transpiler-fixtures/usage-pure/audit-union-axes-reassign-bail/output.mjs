import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
// usage-pure twin of the reachable-union producers: no reachable-union machinery exists off
// usage-global, so no alternative earns anything here. pure keeps only its reassignment-SAFE
// rewrites - the receiver-live instance Maybe-variant (`_includes(C.prototype)` reads whichever
// ctor flows) and the bare ctor substitution (`M = _Iterator`); the `in` read stays raw. locks
// the mode split of the union choke
let C = Array;
if (_globalThis.cond) C = String;
export const m = _includes(C.prototype);
let O = {};
if (_globalThis.cond) O = Array;
export const viaReceiver = 'from' in O;
var M = [1];
if (_globalThis.cond) M = _Iterator;
export function f({
  from
} = M) {
  return from;
}