import _includes from "@core-js/pure/actual/instance/includes";
const viaSpread = {
  ...source,
  slots: [1, 2],
  read() {
    var _ref;
    return _includes(_ref = this.slots).call(_ref, 1);
  }
};
viaSpread.borrowed();