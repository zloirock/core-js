// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
let from, mapped, others;
({ Array: { from }, mapped = [10].flatMap(String), ...others } = globalThis);
from([11]);
mapped;
