// A realm getter behind a sequence prefix is evaluated once for several nested leaves.
// The quiet surface retains its normal reusable navigation.
const log = [];
const A = Array;
Object.defineProperty(globalThis, 'Array', {
  configurable: true,
  get() { log.push('Array'); return A; },
});
const { prototype: { at, values } } = (log.push('prefix'), globalThis.Array);
export { at, values, log };
