// both operands non-proxy: nothing to substitute, the destructure stays native
let e = Math.random() < 0.5;
let p = null;
let q = { Promise: { allSettled: v => v } };
let z = { Promise: { allSettled: v => v } };
const { Promise: { allSettled } } = e ? (p || q) : z;
export const viaNonProxy = allSettled([]);
