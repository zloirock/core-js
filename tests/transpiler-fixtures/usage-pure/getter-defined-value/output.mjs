import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// Replacing an array getter with a string value invalidates the getter return proof.
const log = [];
const box = {
  get data() {
    return [8, 9];
  }
};
Object.defineProperty(box, "data", {
  value: "pq"
});
const r = _includes(_ref = box.data).call(_ref, "pq");
export { r };
export const effects = log;