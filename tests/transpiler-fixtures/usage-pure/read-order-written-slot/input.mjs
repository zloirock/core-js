// An opaque slot write may replace the initial static receiver with an instance.
let r;
const w = { k: Object };
const make = Function("return [1, 2]");
w.k = make();
r = w.k.at(-1);
use(r);
