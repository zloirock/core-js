// `const k = 'iterator'; Symbol[k] in obj` - branch 2 of handleBinaryIn.
// resolveKey follows `k` binding to StringLiteral init, returns 'iterator'.
// MemberExpression `Symbol[k]` then resolves to Symbol.iterator in the computed branch
const k = 'iterator';
const x = Symbol[k] in obj;
