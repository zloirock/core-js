import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A getter body can replace the receiver prototype before an inherited read.
const log = [];
const box = {
  get setup() {
    Object.setPrototypeOf(this, {
      toString: "pq"
    });
    return 0;
  }
};
void box.setup;
const r = _includes(_ref = box.toString).call(_ref, "pq");
export { r };
export const effects = log;