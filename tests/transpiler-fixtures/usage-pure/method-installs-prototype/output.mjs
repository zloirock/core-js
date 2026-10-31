import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A method body can replace the receiver prototype before an inherited read.
const log = [];
const box = {
  setup() {
    Object.setPrototypeOf(this, {
      toString: "pq"
    });
  }
};
box.setup();
const r = _includes(_ref = box.toString).call(_ref, "pq");
export { r };
export const effects = log;