import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref;
// An unchanged getter keeps its array family and runs once per source read.
const log = [];
const box = {
  get data() {
    _pushMaybeArray(log).call(log, "get");
    return [8, 9];
  }
};
const r = _includesMaybeArray(_ref = box.data).call(_ref, 9);
export { r };
export const effects = log;