// A stored declaration keeps its effects while the iterator helper owns the read.
let held;
const { globalThis: { Array: { prototype: { [Symbol.iterator]: iterator } }, Object: object } } = (effect(), held = globalThis);
export { held, iterator, object };
