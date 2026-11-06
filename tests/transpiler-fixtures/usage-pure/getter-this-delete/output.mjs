import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A receiver method can delete its own getter before the next read.
const log = [];
const box = {
  __proto__: {
    data: "pq"
  },
  get data() {
    return [8, 9];
  },
  remove() {
    delete this.data;
  }
};
box.remove();
const r = _includes(_ref = box.data).call(_ref, "pq");
export { r };
export const effects = log;