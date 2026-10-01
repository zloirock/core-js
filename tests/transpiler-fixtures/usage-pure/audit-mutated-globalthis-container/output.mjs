// a bare write of `globalThis` itself taints the WHOLE container: pure cannot reason about a
// rewritten global object, so every global name in the file DEOPTS - all reads stay verbatim
// and nothing is imported
[globalThis] = pair;
use(globalThis.Promise.resolve(1));
use(other);