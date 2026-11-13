// A prototype iterator and its static sibling share the same native pattern reads.
const { Array: { from, prototype: { [Symbol.iterator]: iterator } } } = globalThis;
export { from, iterator };
