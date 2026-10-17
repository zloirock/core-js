import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const localHolder = {};
localHolder.f = {
  nums: [6],
  pick() {
    var _ref;
    return _atMaybeArray(_ref = this.nums).call(_ref, 6);
  }
};