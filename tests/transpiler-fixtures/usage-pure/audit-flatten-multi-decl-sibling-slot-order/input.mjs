// Nested statics, residual reads and plain siblings retain their source declaration order.
const a = effA(), { Map: { groupBy } } = globalThis, b = effB();
const c = effC(), { Promise: { try: tryFn, customP } } = globalThis;
console.log(a, groupBy, b, c, tryFn, customP);
