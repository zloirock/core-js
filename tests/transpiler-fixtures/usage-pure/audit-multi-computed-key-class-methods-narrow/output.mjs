import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// multiple computed-key methods in the same class: each method's body-side walk must
// resolve to the class context independently. cache-poisoning fix means the first method's
// key-side walk doesn't corrupt the cache for the second method's body walk
class C {
  static A = "a";
  static B = "b";
  items = [1, 2, 3];
  [C.A]() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
  [C.B]() {
    var _ref2;
    return _atMaybeArray(_ref2 = this.items).call(_ref2, -1);
  }
}
new C()["a"]();