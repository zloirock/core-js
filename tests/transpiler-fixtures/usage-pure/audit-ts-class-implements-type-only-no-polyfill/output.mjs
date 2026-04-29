import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// `class C implements Map<K, V>` - parsers represent the implements clause's type
// reference differently (some wrap in a dedicated implements-clause node, others use an
// extends-clause type-args node under the implements list-key). The implements-slot
// node form must be classified as type-only so the inner `Map` identifier is not
// treated as a runtime reference. Otherwise an unused `Map` polyfill import would be
// injected. Uses `.flat()` (real IE11-missing polyfill) so the output diff isolates:
// only `flat` should emit, NOT `Map` from the implements slot
class C implements Map<string, number> {
  get items() {
    var _ref;
    return _flatMaybeArray(_ref = [1, [2, 3]]).call(_ref);
  }
}
new C().items;