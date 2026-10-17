// a direct read before the aliasing write keeps the RUNTIME ctor guard: the pre-write
// read falls to the raw member and throws natively, the post-write path gets the polyfill
let M4;
export const f = M4.groupBy(items, keyFn);
({ Map: M4 } = globalThis);
