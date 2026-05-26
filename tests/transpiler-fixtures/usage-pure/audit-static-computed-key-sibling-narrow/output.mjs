import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// computed-key static method co-existing with sibling instance method: the static
// method's key-side walk must not poison the cache for the sibling instance method's body
// walk. cross-member cache invariant
class C {
  static K = "k";
  items = [1, 2, 3];
  static [C.K]() {
    return "static";
  }
  inst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
new C().inst();