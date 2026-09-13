import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A conditional realm feeds a nested constructor pattern with a live default.
// Guarding the constructor read must keep the default's Array.of claim alive.
function read(enabled) {
  if (enabled) {
    var realm = _globalThis;
  }
  const {
    missing = _Array$of(7)
  } = realm === _globalThis ? _Promise : realm.Promise;
  return missing;
}
export const value = read(true);