// iterable array-pattern destructure: the iteration protocol must be polyfilled
// because destructuring an iterable invokes the iterator protocol at runtime.
const [a, b] = arr;