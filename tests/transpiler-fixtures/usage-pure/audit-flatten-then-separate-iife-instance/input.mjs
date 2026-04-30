// proxy flatten + separate (non-sibling) IIFE statement with instance dispatch. asserts
// the insert-inside-overwrite bug is gated on multi-decl mode (sibling participating in
// the same VariableDeclaration), not just any IIFE in a nearby statement
const { Array: { from } } = globalThis;
const kls = (() => {
  return [].values();
})();
export { from, kls };
