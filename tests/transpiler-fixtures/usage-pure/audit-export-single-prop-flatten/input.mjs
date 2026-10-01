// An exported nested static keeps its source export name and receives the pure method.
export const { Array: { from } } = globalThis;
from([1, 2]);
