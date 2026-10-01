import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Getter property whose return value is a known callable -
// object-member resolution should detect the getter and route through its body's return value.
const obj = {
  get fn() {
    return [1, 2, 3];
  }
};
_atMaybeArray(_ref = obj.fn).call(_ref, 0);