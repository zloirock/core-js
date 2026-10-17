import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A caught receiver can lose its getter and expose the inherited string.
const log = [];
const box = {
  __proto__: {
    data: "pq"
  },
  get data() {
    return [8, 9];
  }
};
try {
  throw box;
} catch (e) {
  delete e.data;
}
const r = _includes(_ref = box.data).call(_ref, "pq");
export { r };
export const effects = log;