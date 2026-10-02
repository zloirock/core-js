import _includes from "@core-js/pure/actual/instance/includes";
import _Reflect$defineProperty from "@core-js/pure/actual/reflect/define-property";
var _ref;
// Reflect can replace an array getter with a string-valued own property.
const log = [];
const box = {
  get data() {
    return [8, 9];
  }
};
_Reflect$defineProperty(box, "data", {
  value: "pq"
});
const r = _includes(_ref = box.data).call(_ref, "pq");
export { r };
export const effects = log;