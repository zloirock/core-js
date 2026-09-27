import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// This definition uses another receiver, so the rows remain an array.
const holder = {
  rows: [],
  touch() {
    return new class {
      hook = sink(this);
    }();
  }
};
holder.touch();
_atMaybeArray(_ref = holder.rows).call(_ref, 0);