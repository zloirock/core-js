import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
const assignedThenDropped = {
  slots: [1, 2],
  read() {
    var _ref;
    return _includesMaybeArray(_ref = this.slots).call(_ref, 1);
  }
};
let sink1;
sink1 = assignedThenDropped;