import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// Both the instance method and retained length read the stored user's list.
let held;
const _ref = (held = _globalThis.host).self.list;
export const at = _at(_ref);
export const {
  length
} = _ref;
export { held };