// Resolve the iterator and its default before the next expression runs.
let method;
const after = (({ [(effect(), Symbol.iterator)]: method = fallback() } = globalThis), finish());
