import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// `class C implements Map<K, V>` - the implements clause is a type-only reference,
// so `Map` must NOT trigger a runtime polyfill import. an unrelated `.flat()` call
// confirms the polyfill emit pipeline still works for actual runtime references
class C implements Map<string, number> {
  get items() {
    var _ref;
    return _flatMaybeArray(_ref = [1, [2, 3]]).call(_ref);
  }
}
new C().items;