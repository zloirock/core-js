import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// Deleting a getter through an alias invalidates the getter return family.
const log = [];
const box = {
  __proto__: {
    data: "pq"
  },
  get data() {
    return [8, 9];
  }
};
const alias = box;
delete alias.data;
const r = _includes(_ref = box.data).call(_ref, "pq");
export { r };
export const effects = log;