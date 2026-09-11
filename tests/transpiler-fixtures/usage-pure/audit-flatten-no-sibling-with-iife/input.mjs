// single-decl proxy flatten - no sibling, no instance method anywhere. asserts the
// minimal flatten case still works as a control variant
const { Array: { from } } = globalThis;
export { from };
