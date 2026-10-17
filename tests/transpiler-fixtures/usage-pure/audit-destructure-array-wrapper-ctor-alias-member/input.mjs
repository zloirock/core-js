// An array-wrapped constructor alias retains its static-method type.
// Later calls use their dedicated pure entries even when the constructor entry omits them.
const [{ Array: A }, tail] = [globalThis, 0];
const [{ Map: M }] = [globalThis];
export const r = [A.from([1, 2, 3]), typeof M.groupBy];
export const effects = tail;
