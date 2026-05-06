// for-of head with nested-proxy destructure init: parent is ForOfStatement, declaration
// is VariableDeclaration but its init slot stores the iterable directly. The flatten
// chain walker reaches a VariableDeclarator parent and breaks - then finds declCount=1,
// willRemoveDeclarator=true, but is NOT a `ForStatement` (only matches isForStatement).
// for-of header pattern destructures each iteration value. distinct keys (from / of)
// probe per-prop dispatch.
for (const { Array: { from } } of [globalThis]) from([1]).length;
for (const { Array: { of } } of [globalThis]) of(7, 8).length;
