import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// A bare non-null assertion erases without ending the optional chain or moving its effects.
export function read(choice) {
  var _ref;
  const effects = [];
  const w: any = typeof window !== "undefined" ? window : undefined;
  return null == w ? void 0 : (_ref = w.Array, _ref === Array ? _Array$of((_pushMaybeArray(effects).call(effects, "arg"), 3)) : _ref.of((_pushMaybeArray(effects).call(effects, "arg"), 3))).length;
}