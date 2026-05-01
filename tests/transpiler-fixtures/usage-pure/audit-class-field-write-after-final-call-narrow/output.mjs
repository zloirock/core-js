import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// temporal flow for class instances: the write `inst.arr = "x"` happens AFTER the final
// `inst.test()` call, so it cannot be observed at any call site. without temporal flow,
// the write would have widened the union to Array|String and narrow would collapse. with
// temporal flow the write is excluded as unreachable, narrow proceeds to `_atMaybeArray`
class C {
  arr = [1, 2, 3];
  test() {
    var _ref;
    return _atMaybeArray(_ref = this.arr).call(_ref, 0);
  }
}
const inst = new C();
inst.test();
inst.arr = "x";