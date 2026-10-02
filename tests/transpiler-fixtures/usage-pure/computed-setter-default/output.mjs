import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref;
// A known computed setter shadows the inherited function and enables the default.
// Only the array default supplies the includes receiver.
const log = [];
const key = "toString";
const box = {
  set [key](value) {}
};
const includes = _includesMaybeArray((_ref = box.toString) === void 0 ? (_pushMaybeArray(log).call(log, "default"), [8, 9]) : _ref);
const r = includes.call([8, 9], 9);
export { r };
export const effects = log;