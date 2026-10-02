import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// Deleting an own getter exposes the inherited string without invoking the removed getter.
const log = [];
const box = {
  __proto__: {
    data: "pq"
  },
  get data() {
    _pushMaybeArray(log).call(log, "get");
    return [8, 9];
  }
};
delete box.data;
const r = _includes(_ref = box.data).call(_ref, "pq");
export { r };
export const effects = log;