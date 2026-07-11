// `[Symbol.iterator]: {next}` - a nested ObjectPattern value consumes like the identifier
// form, destructuring the get-iterator-method RESULT (`{ next } = _getIteratorMethod(obj)`):
// value-correct on modern engines (the helper returns the same method a raw read yields) and
// polyfill-visible where a raw symbol read misses native iterators; the receiver keeps the
// user binding `obj`
const obj = globalThis;
const { Array: { from }, [Symbol.iterator]: { next } } = obj;
console.log(from, next);
