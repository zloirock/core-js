// a generator IIFE runs NO body at the call: the read inside it happens at the consumer's first
// `.next()`, after the array write below, so the string init proves nothing and both families
// inject. the synchronous IIFE beside it does run at its call, before the write - its narrow holds
let O = 'str';
export const it = (function* () { yield O.at(0); })();
O = [1, 2];
let P = 'str';
export const r = (function () { return P.includes('a'); })();
P = [1, 2];
