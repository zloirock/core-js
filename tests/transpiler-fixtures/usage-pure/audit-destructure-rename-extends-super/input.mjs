// Double-destructure: `const { Set } = globalThis` - shorthand destructure with Identifier
// key resolves through findDestructureKeyForBinding (value = key = 'Set'). Then
// `class C extends Set { ... }` should resolve super to Set's static surface.
// `Set.union([...])` is a valid ES2025 method that gets polyfilled.
const { Set } = globalThis;
class C extends Set {
  static combine(a, b) { return super.union(a, b); }
}
