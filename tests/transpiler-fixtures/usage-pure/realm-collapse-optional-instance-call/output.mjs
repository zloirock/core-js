import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  var _ref;
  return null == (_ref = null == (_pushMaybeArray(effects).call(effects, "prefix"), _globalThis).window ? void 0 : _globalThis.items) ? void 0 : _at(_ref)?.call(_ref, -1);
}