// babel-plugin: shared gate for computed-key synth-swap. a computed key Identifier that resolves
// to a generated import (a polyfill-rewritten well-known symbol, `[Symbol.iterator]` rewritten to
// `[_Symbol$iterator]`) or has no source binding is NOT a user const-key. babel mutates the AST in
// place, so by the time the synth gate runs the symbol key already reads as an Identifier import;
// unplugin's deferred text-transform still sees the original `Symbol.iterator` MemberExpression and
// bails. require every computed key to resolve to a LOCAL (non-import) source binding so both
// pipelines stay aligned. a user const key (`const k = 'of'`) has a stable binding; the injected
// import has no binding in the param scope cache (or an import binding) - bail either way.
// `t` is babel-types (passed in so this stays a pure module-level helper, no factory state)
export function patternComputedKeysAreUserLocals(t, objectPatternNode, scope) {
  for (const p of objectPatternNode.properties) {
    if (!p.computed || !t.isIdentifier(p.key)) continue;
    const binding = scope.getBinding(p.key.name);
    if (!binding || binding.path.isImportDefaultSpecifier() || binding.path.isImportSpecifier()
      || binding.path.isImportNamespaceSpecifier()) return false;
  }
  return true;
}
