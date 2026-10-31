// A computed exclusion before a nested static and rest keeps the pure pattern native.
// Native getter order wins over polyfill coverage; global injection remains active.
const [{ [Symbol.iterator]: iterator, Array: { from }, ...rest }] = [globalThis];
use(iterator, from, rest);
