// babel-plugin: computed-key synth-swap safety gate. a computed key is safe to mirror into a synth
// literal (`[k]: _polyfill` / `[k]: receiver[k]`) when it resolves to a STABLE in-scope value: a user
// local (`const k = 'of'`) or a genuine user import (replayed losslessly as `[X]: receiver[X]`). it is
// UNSAFE when:
//   - it has no binding (a bare global like `[Set]`) - emitted raw it ReferenceErrors on the target
//   - its binding is a polyfill-rewritten well-known symbol. babel mutates `[Symbol.iterator]` to
//     `[_Symbol$iterator]` (a core-js import) BEFORE this gate runs, so it reads as an Identifier
//     import; unplugin's deferred text-transform still sees the original `Symbol.iterator`
//     MemberExpression and bails via isSynthSimpleObjectPattern. bailing the core-js-sourced import
//     keeps the two pipelines aligned, while a genuine user import does NOT bail
// `t` is babel-types (passed in so this stays a pure module-level helper, no factory state)
export function patternComputedKeysSynthSafe(t, objectPatternNode, scope) {
  for (const p of objectPatternNode.properties) {
    if (!p.computed || !t.isIdentifier(p.key)) continue;
    const binding = scope.getBinding(p.key.name);
    if (!binding) return false;
    const isImport = binding.path.isImportDefaultSpecifier() || binding.path.isImportSpecifier()
      || binding.path.isImportNamespaceSpecifier();
    if (isImport && isCoreJSImportSpecifier(binding.path)) return false;
  }
  return true;
}

// a generated polyfill import (the only import that reaches the gate as a rewritten symbol key) is
// sourced from a `core-js` / `@core-js` module; a user import is not
function isCoreJSImportSpecifier(specifierPath) {
  const source = specifierPath.parentPath?.node?.source?.value;
  return typeof source === 'string' && source.includes('core-js');
}
