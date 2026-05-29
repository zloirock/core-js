import _at from "@core-js/pure/actual/instance/at";
// `data` is never a declared own property: an external write seeds it as an array, but a
// method writes it to an incompatible type. The inside-method write must join the candidate
// union so the read bails to the general variant.
const obj = {
  poison() {
    this.data = "shadowed";
  },
  read() {
    var _ref;
    return _at(_ref = this.data).call(_ref, -1);
  }
};
obj.data = [1, 2, 3];
obj.poison();
obj.read();