// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const { Array: { from } } = globalThis, { at, ...rest } = getArr();
from([1]);
console.log(at, rest);
