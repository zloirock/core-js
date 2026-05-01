// two declarators in the same VariableDeclaration each destructuring from a proxy global.
// both should fully consume their receiver via nested-proxy flatten. asserts that the
// per-decl `rewriteDeclarator` plan walks each declarator independently
const { Array: { from } } = globalThis, { Object: { fromEntries } } = self;
export { from, fromEntries };
