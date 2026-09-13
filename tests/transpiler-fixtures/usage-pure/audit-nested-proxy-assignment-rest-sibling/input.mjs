// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
let from, rest, fromEntries, inner;
({ Array: { from }, ...rest } = globalThis);
({ Object: { fromEntries, ...inner } } = globalThis);
