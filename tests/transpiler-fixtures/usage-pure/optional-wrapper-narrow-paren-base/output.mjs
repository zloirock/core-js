import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Parentheses around a nullable base do not prevent its guarded static from being served.
export function read(choice) {
  var _ref;
  const effects = [];
  let w: any = _globalThis;
  if (choice) w = null;
  return null == w ? void 0 : (_ref = w.Array, _ref === Array ? _Array$of((_pushMaybeArray(effects).call(effects, "arg"), 3)) : _ref.of((_pushMaybeArray(effects).call(effects, "arg"), 3)))[0];
}