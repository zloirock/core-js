// multi-decl where one declarator is a flattenable nested proxy-destructure and the sibling
// references a polyfillable global (bare Identifier or static MemberExpression). flatten's
// raw-text reuse of the sibling needs the identifier visitor to fire on the sibling's globals
// so its transform composes into the outer's replacement; previously walkAstNodes(declaration)
// blanket-skipped the entire VariableDeclaration, leaving siblings un-polyfilled at runtime
const { Array: { from } } = globalThis, y = globalThis;
const { Map: { groupBy } } = self, sym = Symbol.iterator;
export { from, y, groupBy, sym };
