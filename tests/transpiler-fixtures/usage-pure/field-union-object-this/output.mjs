import _includes from "@core-js/pure/actual/instance/includes";
// Own method writes contribute to the field union read through this.
// Pure keeps generic dispatch; the precise family set is observed by the global twin.
const box = {
  data: [10, 20],
  change() {
    this.data = "1020";
  },
  read() {
    var _ref;
    return _includes(_ref = this.data).call(_ref, "02");
  }
};
box.change();
export const result = box.read();