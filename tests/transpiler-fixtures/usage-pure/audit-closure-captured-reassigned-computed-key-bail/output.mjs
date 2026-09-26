import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// a computed key captured in a closure is re-read on every re-invocation, so a reassignment that
// lands AFTER the closure is defined is observed on a later call. pure cannot fold such a key to a
// single static without silently miscompiling the other observations - it must keep the native
// dynamic dispatch. when NO write lands after the definition the key IS the uniquely observed value
// and pure still folds it. distinct constructor per line so each import set is attributable
let k1 = "of";
k1 = "from";
export const f = () => Array[k1]([1]);
f();
k1 = "of";
f();
let k2 = "fromEntries";
export const g = () => _Object$fromEntries([["a", 1]]);
g();