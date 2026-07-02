// babel-plugin: computed-key synth-swap safety gate. a computed key is safe to mirror into a synth
// literal (`[k]: _polyfill` / `[k]: receiver[k]`) when it resolves to a STABLE in-scope value: a user
// local (`const k = 'of'`) or a genuine user import (replayed losslessly as `[X]: receiver[X]`). it is
// UNSAFE when:
//   - it has no binding (a bare global like `[Set]`) - emitted raw it ReferenceErrors on the target
//   - its binding is a polyfill-rewritten well-known symbol. babel mutates `[Symbol.iterator]` to
//     `[_Symbol$iterator]` (a core-js pure import) BEFORE this gate runs, so it reads as an
//     Identifier; unplugin's deferred text-transform still sees the original `Symbol.iterator`
//     MemberExpression and bails via isSynthSimpleObjectPattern. bailing the injected pure-import
//     reference keeps the two pipelines aligned, while a genuine user import does NOT bail
// `t` is babel-types (passed in so this stays a pure module-level helper, no factory state).
// `isInjectedReference(node)` is the injector's node-identity test for a reference IT placed - a
// rewritten member key, NOT a user binding (a `core-js`-substring path import like `a-core-js-helper`
// that the old source-string check misread, nor the user's own deduped `@core-js/pure` import that a
// name-based check would over-bail). node-identity matches exactly what unplugin bails on (the
// original MemberExpression), so the two pipelines stay aligned
export function patternComputedKeysSynthSafe(t, objectPatternNode, scope, isInjectedReference) {
  for (const p of objectPatternNode.properties) {
    if (!p.computed || !t.isIdentifier(p.key)) continue;
    // a polyfill-rewritten member key (`[Symbol.iterator]` -> `[_Symbol$iterator]`) - bail to match unplugin
    if (isInjectedReference(p.key)) return false;
    // no binding: a bare global (`[Set]`) emitted raw ReferenceErrors on the target - unsafe.
    // any other in-scope value (user local / user import) replays losslessly as `[X]: receiver[X]`
    if (!scope.getBinding(p.key.name)) return false;
  }
  return true;
}
