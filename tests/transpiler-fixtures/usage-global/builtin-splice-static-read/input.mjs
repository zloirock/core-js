// The later slot read stays as written. Global retains conservative Map injection;
// narrowing a value installed by a builtin is deferred.
const b = [Object];
b.splice(0, 1, Map);
const result = typeof b[0].groupBy;
