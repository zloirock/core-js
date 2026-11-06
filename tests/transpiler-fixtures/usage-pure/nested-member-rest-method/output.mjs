import _includes from "@core-js/pure/actual/instance/includes";
// A copied method can run with the rest copy as this and a different field type.
const wrap = {
  box: {
    data: [10, 20],
    read() {
      var _ref;
      return _includes(_ref = this.data).call(_ref, "02");
    }
  }
};
const {
  ...copy
} = wrap.box;
copy.data = "1020";
export const result = copy.read();