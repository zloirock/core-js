import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A write through an instance field's this cannot replace an unrelated container's slot.
const box = {
  values: [1, 2]
};
class C {
  value = this.values = 'abc';
}
consume(new C(), _atMaybeArray(_ref = box.values).call(_ref, -1));