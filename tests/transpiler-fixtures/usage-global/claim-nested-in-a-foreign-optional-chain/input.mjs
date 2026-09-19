// a claim nested in an optional chain that is NOT its own. the source is not rewritten under this
// method, so the import set is the whole observable - one method per row keeps a dropped module
// visible instead of letting a sibling mask it
const r1 = host?.fn(Array?.from([1]));
const r2 = host?.wrap[Array?.of(2).length];
const r3 = host?.a.b(Promise?.resolve(3));
const r4 = host?.fn?.(Object?.entries);
const r5 = globalThis.window?.Array.isArray([4]);
const r6 = list.flat?.(1);
console.log(r1, r2, r3, r4, r5, r6);
