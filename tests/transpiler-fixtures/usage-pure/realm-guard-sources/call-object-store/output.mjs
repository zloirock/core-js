import _globalThis from "@core-js/pure/actual/global-this";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
// Keep the source guard and distinguish realm values from user properties.
function h() {
  return _globalThis.window;
}
let w;
export const r = null == (w = h()) ? void 0 : _Object$hasOwn({
  x: 1
}, 'x');