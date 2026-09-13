// Passing Map to a builtin does not require its full namespace.
// Pure deliberately leaves the later slot read native: following a value installed
// by a builtin is deferred. The constructor entry alone does not provide groupBy.
const b = [];
b.push(Map);
const result = typeof b[0].groupBy;
