import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A decided realm alias feeds the constructor pattern directly.
// Its original leaf default keeps the Array.of claim alive.
function read(enabled) {
  if (enabled) {
    var realm = _globalThis;
  }
  const {
    missing = _Array$of(7)
  } = _Promise;
  return missing;
}
export const value = read(true);