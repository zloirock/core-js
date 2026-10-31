// A bare global read beside a nested static keeps its own pure binding.
const { Array: { from } } = globalThis, host = globalThis;
export { from, host };
