// Each pattern reads the intermediate slot once, including quoted and numeric property names.
let item, iterator;
({ 'a-b': { item, [Symbol.iterator]: iterator } } = globalThis.Array);
({ 0: { item, [Symbol.iterator]: iterator } } = globalThis.Array);
export { item, iterator };
