// A prototype iterator beside a static is served without losing its assignment target.
let from, iterator;
({ Array: { from, prototype: { [Symbol.iterator]: iterator } } } = globalThis);
export { from, iterator };
