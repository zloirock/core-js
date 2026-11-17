// A numeric intermediate slot is read once before its iterator property.
let item, iterator;
({ 0: { item, [Symbol.iterator]: iterator } } = globalThis.Array);
export { item, iterator };
