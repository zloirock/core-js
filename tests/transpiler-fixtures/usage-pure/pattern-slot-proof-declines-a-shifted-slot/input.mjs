// a pattern slot read as PROVEN - a destructured parameter's leaf, a pattern-bound callee, a key or a
// container a call-site pattern write reaches - holds nothing certain where a spread before it may
// shift the slot: each such read stays native, while its unshifted twin resolves
const tail = [];
function leaf([, h]) { return h; }
leaf([...tail, { K: Map }]).K.groupBy(src, fn);
leaf([0, { K: Promise }]).K.try(fn);
const [, make] = [...tail, () => Array];
make().from(src);
const [, make2] = [0, () => Iterator];
make2().from(src);
function keys() { return [...tail, 'fromEntries']; }
let key = 'x';
[, key] = keys();
Object[key](src);
function keys2() { return [0, 'withResolvers']; }
let key2 = 'x';
[, key2] = keys2();
Promise[key2]();
function hops() { return [...tail, { K: Math }]; }
let hop = { K: Math };
[, hop] = hops();
hop.K.sumPrecise(src);
function hops2() { return [0, { K: Error }]; }
let hop2 = { K: Error };
[, hop2] = hops2();
hop2.K.isError(src);
