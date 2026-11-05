// A native array-wrapped constructor extraction still supplies a type hint for later static reads.
// Array.from and Map.groupBy calls use their dedicated pure entries.
const [{ Array: A }, tail] = [globalThis, 0];
const [{ Map: M }] = [globalThis];
export const r = [A.from([1, 2, 3]), typeof M.groupBy];
export const effects = tail;
