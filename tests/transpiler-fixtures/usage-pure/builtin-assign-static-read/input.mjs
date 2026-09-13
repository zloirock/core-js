// Passing Map to a builtin does not require its full namespace.
// Pure deliberately leaves the later slot read native: following a value installed
// by a builtin is deferred. The constructor entry alone does not provide groupBy.
const w = { k: Object };
Object.assign(w, { k: Map });
const result = typeof w.k.groupBy;
