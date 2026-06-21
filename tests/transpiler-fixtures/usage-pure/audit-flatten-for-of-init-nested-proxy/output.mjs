import _globalThis from "@core-js/pure/actual/global-this";
// for-of head with nested-proxy destructure init: parent is ForOfStatement, declaration
// is VariableDeclaration but its init slot stores the iterable directly. The flatten path
// reaches a single VariableDeclarator that will be removed, yet the parent is a
// ForOfStatement, NOT a ForStatement - the for-init SE-sink special case must not fire here.
// for-of header destructures each iteration value; distinct keys (from / of) probe per-prop dispatch.
for (const {
  Array: {
    from
  }
} of [_globalThis]) from([1]).length;
for (const {
  Array: {
    of
  }
} of [_globalThis]) of(7, 8).length;