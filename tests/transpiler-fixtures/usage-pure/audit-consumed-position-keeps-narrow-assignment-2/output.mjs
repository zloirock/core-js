import _includes from "@core-js/pure/actual/instance/includes";
const assignedThenHandedOut = {
  items: [1, 2],
  read() {
    var _ref;
    return _includes(_ref = this.items).call(_ref, 1);
  }
};
let sink2;
sink(sink2 = assignedThenHandedOut);