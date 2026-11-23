// The key, iterator lookup and default all belong to the unbraced branch.
let method;
if (enabled) ({ [(effect(), Symbol.iterator)]: method = fallback() } = globalThis);
