// Passing Map to a builtin does not require its full namespace.
// Pure deliberately leaves the later slot read native: following a value installed
// by a builtin is deferred. The constructor entry alone does not provide groupBy.
const b = [];
Reflect.apply(b.push, b, [Map]);
const result = typeof b[0].groupBy;
