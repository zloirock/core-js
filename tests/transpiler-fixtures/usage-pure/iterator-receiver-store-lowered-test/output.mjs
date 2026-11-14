import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// A lowered optional test must read the retained environment value before its key.
export function read(effects) {
  var _ref;
  _globalThis.box = [3];
  let held, ref;
  return (ref = (_pushMaybeArray(effects).call(effects, 'prefix'), held = _globalThis.window, null == held ? null.self : held)) == null ? void 0 : _at(_ref = ref[_pushMaybeArray(effects).call(effects, 'key'), 'box']).call(_ref, 0);
}