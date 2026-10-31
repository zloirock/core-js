// The raw keyed default and its overwrite stay inside the unbraced branch.
// A realm rewrite must remain visible to the later receiver read.
let method;
if (enabled) ({ [(effect(), Symbol.iterator)]: method = fallback() } = globalThis);
