import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `new C()?.other()` is an optional call on a transient instance. Recognizing its optional-member
// receiver keeps the class binding from looking "escaped", so the instance field `items` stays
// `number[]` and `.at` inside `getFirst` gets the array-specific polyfill.
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
  other() {}
}
const c = new C();
new C()?.other();
c.getFirst();