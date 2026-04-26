// `class C implements Map<K, V>` - oxc wraps the type reference in TSClassImplements
// (babel: TSExpressionWithTypeArguments under listKey 'implements'). without TSClassImplements
// in TS_TYPE_ONLY_NODES, the inner `Map` Identifier looks like a runtime reference and
// the plugin injects `import _Map from "@core-js/pure/.../map"` for unused type metadata.
// uses `.flat()` (real polyfill candidate, IE11 missing) so output diff isolates: only
// `flat` polyfill should emit, NOT `Map` from the implements slot
class C implements Map<string, number> {
  get items() { return [1, [2, 3]].flat(); }
}
new C().items;
