import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// computed-key getter (accessor): same as method case - the getter shape goes through
// the same cache key, body-side narrow must survive the key-side walk's null result
class C {
  static K = "val";
  items = [1, 2, 3];
  get [C.K]() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
new C()["val"];