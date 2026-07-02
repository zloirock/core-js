// `'from' in Array` - static `in` check against the global Array constructor.
// Folds to `true` at compile time (polyfill present)
'from' in Array;
// `'at' in [1,2,3]` - right is a literal array expression with no resolvable receiver.
// No polyfill emitted, expression stays untouched
'at' in [1, 2, 3];
// `'from' in localVar` - right is a local binding initialized to a literal array.
// Plugin cannot prove the receiver is the global `Array`, leaves the expression as-is
const localVar = [];
'foo' in localVar;
