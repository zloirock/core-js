import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
const realm = _globalThis;
export function read(effect) {
  var _ref, _ref2;
  let held;
  return [(held = realm).window.field, (effect(), realm).window.field, window == null ? void 0 : _at(_ref = _self.value).call(_ref, 0), window == null ? void 0 : _at(_ref2 = window.window.value).call(_ref2, 0)];
}