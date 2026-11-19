// The initializer runs once before either the static or the prototype iterator binds.
let from, iterator;
({ Array: { from, prototype: { [Symbol.iterator]: iterator } } } = (effect(), globalThis));
export { from, iterator };
