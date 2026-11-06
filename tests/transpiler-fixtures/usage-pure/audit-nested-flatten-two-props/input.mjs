// Both static properties under one constructor receive their independent pure values.
const { Array: { from: f, of: o } } = globalThis;
const result = f([1]).concat(o(2));
export { result };
