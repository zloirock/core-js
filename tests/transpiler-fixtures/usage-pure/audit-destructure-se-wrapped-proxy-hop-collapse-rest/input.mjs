// Object-rest keeps the affected pattern native, including inside an array wrapper.
// Independent reads and key/default expressions still receive their own polyfills.
const { from, ...rest } = (sideEffect(), globalThis.self.Array);
from([1, 2, 3]);
rest;
