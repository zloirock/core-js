// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const { Array: { from, ...rest } } = globalThis;
from([1, 2]);
export { rest };
