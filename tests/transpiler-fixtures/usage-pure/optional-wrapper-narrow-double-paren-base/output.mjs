import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Parentheses around a nullable base do not prevent its guarded static from being served.
export function read(choice) {
  var _ref;
  const effects = [];
  let w: any = _globalThis;
  if (choice) w = null;
  return null == w ? void 0 : (_ref = w.Array, _ref === Array ? _Array$from((_pushMaybeArray(effects).call(effects, "arg"), [3])) : _ref.from((_pushMaybeArray(effects).call(effects, "arg"), [3])))[0];
}