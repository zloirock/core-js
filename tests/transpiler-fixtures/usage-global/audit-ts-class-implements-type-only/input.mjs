// global-mode parity for usage-pure/audit-ts-class-implements-type-only-no-polyfill.
// `class C implements Map<K, V>` - oxc wraps in an implements clause node, babel in an
// extends-clause type-args node. neither should trigger es.map polyfill from the
// implements slot; only `.flat()` runtime usage emits its polyfill
class C implements Map<string, number> {
  get items() { return [1, [2, 3]].flat(); }
}
new C().items;
