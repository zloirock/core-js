// A computed static key under an array wrapper and a nested computed instance key
// both receive polyfills. Each key effect runs once, before its corresponding source read.
let c1 = 0;
const [{ [(c1++, 'from')]: from }, other] = [Array, {}];
// nested-pattern variant with a plus-fold key on an instance method
let c2 = 0;
const arr = [1];
const { y: { [(c2++, 'a') + 't']: at } } = { y: arr };
export const r = [from, at, other, c1, c2];
