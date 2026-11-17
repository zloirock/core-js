// A quoted intermediate slot is read once before its iterator property.
let item, iterator;
({ 'a-b': { item, [Symbol.iterator]: iterator } } = globalThis.Array);
export { item, iterator };
