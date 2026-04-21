// `'from' in Array` - resolveKey for left returns 'from' (string literal).
// resolveObjectName for right-Array returns 'Array' (known global static).
// Emit `{kind: 'in', key: 'from', object: 'Array', placement: 'static'}`
'from' in Array;
// `'at' in [1,2,3]` - right is ArrayExpression, resolveObjectName returns null. No polyfill
'at' in [1, 2, 3];
// `'from' in localVar` - right has local binding. resolveObjectName sees `localVar` is bound
// without resolving to global; returns null via resolveBindingToGlobal's VariableDeclarator
// init = ArrayExpression (not Identifier/MemberExpression). No polyfill
const localVar = [];
'foo' in localVar;
