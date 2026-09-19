import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// a conditionally reassigned CONSTRUCTOR alias read through `.prototype` unions its reachable
// ctors on the receiver axis: each reachable ctor dispatches the key as its OWN prototype method
// (the general static-dispatch shape already unioned; the prototype navigation dropped this axis).
// the second read crosses a reassigned ctor with a reassigned computed key: the reachable ctor
// earns typed prototype rows for every reachable key, and the dominating ctor keeps its typeless
// key alternatives
let C = Array;
if (globalThis.cond) C = String;
export const m = C.prototype.includes;
let C2 = Array;
let K = 'at';
if (globalThis.cond) {
  C2 = String;
  K = 'flat';
}
export const x = C2.prototype[K];