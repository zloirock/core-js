import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref;
// A setter after a data property resets the slot to a setter-only descriptor.
// Only the array default supplies the includes receiver.
const log = [];
const box = {
  toString: [8, 9],
  set toString(value) {}
};
const includes = _includesMaybeArray((_ref = box.toString) === void 0 ? (_pushMaybeArray(log).call(log, "default"), [8, 9]) : _ref);
const r = includes.call([8, 9], 9);
export { r };
export const effects = log;