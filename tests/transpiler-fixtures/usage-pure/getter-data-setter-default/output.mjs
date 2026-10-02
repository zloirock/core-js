import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref;
// A data property breaks a getter/setter pair, so the final setter reads undefined.
// Only the array default supplies the includes receiver.
const log = [];
const box = {
  get toString() {
    return [8, 9];
  },
  toString: [1],
  set toString(value) {}
};
const includes = _includesMaybeArray((_ref = box.toString) === void 0 ? (_pushMaybeArray(log).call(log, "default"), [8, 9]) : _ref);
const r = includes.call([8, 9], 9);
export { r };
export const effects = log;