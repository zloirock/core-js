// usage-pure twin of the reachable-union producers: no reachable-union machinery exists off
// usage-global, so no alternative earns anything here. pure keeps only its reassignment-SAFE
// rewrites - the receiver-live instance Maybe-variant (`_includes(C.prototype)` reads whichever
// ctor flows) and the bare ctor substitution (`M = _Iterator`); the `in` read stays raw. locks
// the mode split of the union choke
let C = Array;
if (globalThis.cond) C = String;
export const m = C.prototype.includes;
let O = {};
if (globalThis.cond) O = Array;
export const viaReceiver = 'from' in O;
var M = [1];
if (globalThis.cond) M = Iterator;
export function f({ from } = M) { return from; }
