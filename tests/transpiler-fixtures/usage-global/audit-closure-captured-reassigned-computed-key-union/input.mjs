// a computed key captured in a closure is re-read on every re-invocation, so a reassignment that
// lands AFTER the closure is defined is observed on a later call - the read reaches BOTH keys.
// usage-global injects the union of the reachable statics (over-inject-safe): the enclosing tail
// write re-enters exactly like a loop back-edge re-runs the body after its tail write. when NO write
// lands after the definition the key resolves to a single static. distinct constructor per line
let k1 = "of";
k1 = "from";
export const f = () => Array[k1]([1]);
f();
k1 = "of";
f();
let k2 = "fromEntries";
export const g = () => Object[k2]([["a", 1]]);
g();
