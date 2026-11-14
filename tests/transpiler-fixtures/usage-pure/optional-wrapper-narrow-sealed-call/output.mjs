import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// Source parentheses keep the read outside the optional chain, including after type erasure.
export function read(choice) {
  var _ref;
  const effects = [];
  const w: any = typeof window !== "undefined" ? window : undefined;
  return (null == w ? void 0 : (_ref = w.Array, _ref === Array ? _Array$of((_pushMaybeArray(effects).call(effects, "arg"), 3)) : _ref.of((_pushMaybeArray(effects).call(effects, "arg"), 3))))!.length;
}