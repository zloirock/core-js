// a claim nested in an optional chain that is NOT its own: the argument, the computed key and a
// deeper hop all belong to the HOST's chain, so deoptionalizing the claim's `?.` must stop at the
// claim. reaching further seals the host's `?.` into parens - a call on `undefined` at runtime.
// the last two rows are the boundary: a claim ON the chain's own spine still deoptionalizes
const r1 = host?.fn(Array?.from([1]));
const r2 = host?.wrap[Array?.of(2).length];
const r3 = host?.a.b(Promise?.resolve(3));
const r4 = host?.fn?.(Object?.entries);
const r5 = globalThis.window?.Array.from([4]);
const r6 = list.at?.(0);
console.log(r1, r2, r3, r4, r5, r6);
