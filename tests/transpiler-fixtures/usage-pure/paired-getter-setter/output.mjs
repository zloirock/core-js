import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref;
// A paired getter and setter keep the getter result and skip the nested default.
const log = [];
const box = {
  get toString() {
    _pushMaybeArray(log).call(log, "get");
    return [8, 9];
  },
  set toString(value) {}
};
const includes = _includesMaybeArray((_ref = box.toString) === void 0 ? (_pushMaybeArray(log).call(log, "default"), [1]) : _ref);
const r = includes.call([8, 9], 9);
export { r };
export const effects = log;