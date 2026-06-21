// two declarators in the same VariableDeclaration each destructuring from a proxy global.
// both should fully consume their receiver via nested-proxy flatten, with each declarator
// planned and rewritten independently
const { Array: { from } } = globalThis, { Object: { fromEntries } } = self;
export { from, fromEntries };
