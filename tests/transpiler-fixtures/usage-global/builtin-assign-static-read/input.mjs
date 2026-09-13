// The later slot read stays as written. Global retains conservative Map injection;
// narrowing a value installed by a builtin is deferred.
const w = { k: Object };
Object.assign(w, { k: Map });
const result = typeof w.k.groupBy;
