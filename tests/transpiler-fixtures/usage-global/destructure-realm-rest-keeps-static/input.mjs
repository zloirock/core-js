// A symbol claim before a static sibling keeps the realm receiver mirror.
// Rest still excludes both consumed properties.
const [{ [Symbol.iterator]: iterator, Array: { from }, ...rest }] = [globalThis];
export { iterator, from, rest };
