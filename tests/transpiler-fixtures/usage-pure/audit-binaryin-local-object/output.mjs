// `'from' in Array` - static `in` check against the global Array constructor.
// Folds to `true` at compile time (polyfill present)
true;
// `'at' in [1,2,3]` - the receiver TYPE is unambiguous (array literal) and the (type, key)
// pair resolves a pure entry: folds to `true` exactly like the static form - every actual
// use of the method is substituted, so the polyfilled world's answer is constant
true;
// `'foo' in localVar` - the receiver type resolves (array) but the key maps to NO pure
// entry: its runtime truth is not ours to assert, the expression stays untouched
const localVar = [];
'foo' in localVar;