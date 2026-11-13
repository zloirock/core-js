import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Keep the source guard and distinguish realm values from user properties.
function get() {
  effect();
  return _globalThis.window;
}
export const r = null == get() ? void 0 : (keyEffect(), _Array$from((argumentEffect(), [3])));